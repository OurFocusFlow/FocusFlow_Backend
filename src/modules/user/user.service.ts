import { Types } from "mongoose";
import { UserReposiroty } from "../../DB/repository/user.repository";
import { 
    BadRequestException, 
    NotFoundException, 
    UnAuthorizedException,
    ForbiddenException
} from "../../common/exceptions/domain.exceptions";
import { compareHash, generateHash } from "../../common/utils/security/hash.security";
import { UpdateProfileDto, UpdatePasswordDto } from "./user.dto";
import { IUser } from "../../common/interfaces/user.interface";
import { ProviderEnum } from "../../common/enums/user.enum";
import { redisService } from "../../common/services/redis.service";

export class UserService {
    private userRepository: UserReposiroty;

    constructor() {
        this.userRepository = new UserReposiroty();
    }

    /**
     * Get user profile by ID
     */
    async getProfile(userId: string | Types.ObjectId): Promise<IUser> {
        // Check cache first
        const cacheKey = `user:profile:${userId}`;
        const cached = await redisService.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        const user = await this.userRepository.findById({
            _id: new Types.ObjectId(userId),
            options: { lean: false }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Cache for 5 minutes
        await redisService.set({
            key: cacheKey,
            value: user.toJSON(),
            ttl: 300
        });

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string | Types.ObjectId, 
        data: UpdateProfileDto
    ): Promise<IUser> {
        // Find user
        const user = await this.userRepository.findById({
            _id: new Types.ObjectId(userId),
            options: { lean: false }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Prevent OAuth users from updating profile
        if (user.provider !== ProviderEnum.SYSTEM) {
            throw new ForbiddenException('Cannot update profile for OAuth users');
        }

        // Build update object with only provided fields
        const updateData: any = {};
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
        if (data.gender !== undefined) updateData.gender = data.gender;

        // Update user
        const updatedUser = await this.userRepository.findOneAndUpdate({
            filter: { _id: userId },
            update: updateData,
            options: { new: true }
        });

        if (!updatedUser) {
            throw new BadRequestException('Failed to update profile');
        }

        // Clear cache
        await redisService.deletekey(`user:profile:${userId}`);

        return updatedUser;
    }

    /**
     * Update user password
     */
    async updatePassword(
        userId: string | Types.ObjectId, 
        data: UpdatePasswordDto
    ): Promise<void> {
        // Find user
        const user = await this.userRepository.findById({
            _id: new Types.ObjectId(userId),
            options: { lean: false }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user is SYSTEM provider (has password)
        if (user.provider !== ProviderEnum.SYSTEM) {
            throw new ForbiddenException('Cannot update password for OAuth users');
        }

        // Verify current password
        const isPasswordValid = await compareHash({
            plainText: data.currentPassword,
            ciphertext: user.password as string
        });

        if (!isPasswordValid) {
            throw new UnAuthorizedException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await generateHash({ plainText: data.newPassword });

        // Update password
        await this.userRepository.findOneAndUpdate({
            filter: { _id: userId },
            update: { password: hashedPassword }
        });

        // Clear cache
        await redisService.deletekey(`user:profile:${userId}`);

        // TODO: Invalidate all active sessions/refresh tokens
    }

    /**
     * Delete user account
     */
    async deleteAccount(userId: string | Types.ObjectId): Promise<void> {
        // Find user
        const user = await this.userRepository.findById({
            _id: new Types.ObjectId(userId),
            options: { lean: false }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Hard delete (permanent)
        await this.userRepository.deleteOne({
            filter: { _id: userId }
        });

        // Clean up Redis cache and data
        await Promise.all([
            redisService.deletekey(`user:profile:${userId}`),
            redisService.removeFCMUser(userId),
            redisService.removeUser(userId)
        ]);
    }

    /**
     * Format user response (remove sensitive data)
     */
    toUserResponse(user: IUser): any {
        const userObject = typeof (user as any).toJSON === 'function' ? (user as any).toJSON() : user;
        const { password, __v, ...userWithoutSensitive } = userObject;
        
        return {
            ...userWithoutSensitive,
            fullName: `${user.firstName} ${user.lastName}`,
            isEmailConfirmed: !!user.confirmEmail,
        };
    }
}

export default new UserService();