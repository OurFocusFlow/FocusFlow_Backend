import {  HydratedDocument, Types } from "mongoose";
import { UserReposiroty } from "../../DB/repository/user.repository";
import { 
    BadRequestException, 
    NotFoundException, 
    UnAuthorizedException,
    ForbiddenException,
    ConflictException
} from "../../common/exceptions/domain.exceptions";
import { compareHash, generateHash } from "../../common/utils/security/hash.security";
import { UpdateProfileDto, UpdatePasswordDto } from "./user.dto";
import { IUser } from "../../common/interfaces/user.interface";
import { ProviderEnum } from "../../common/enums/user.enum";
import { RedisService, redisService } from "../../common/services/redis.service";
import { LogoutEnum, TokenService } from "../../common/index.js";

export class UserService {
    private userRepository: UserReposiroty;
    private token :TokenService
    private redis :RedisService

    constructor() {
        this.userRepository = new UserReposiroty();
        this.token = new TokenService()
        this.redis = redisService
    }

    async getProfile(user:HydratedDocument<IUser>): Promise<any> {

        return user.toJSON();
    }

    async updateProfile(
        userId: string | Types.ObjectId, 
        data: UpdateProfileDto
    ): Promise<IUser> {
        const user = await this.userRepository.findById({
            _id: new Types.ObjectId(userId),
            options: { lean: false }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }


        if (user.provider !== ProviderEnum.SYSTEM) {
            throw new ForbiddenException('Cannot update profile for OAuth users');
        }

        const updateData: any = {};
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
        if (data.gender !== undefined) updateData.gender = data.gender;

        const updatedUser = await this.userRepository.findOneAndUpdate({
            filter: { _id: userId },
            update: updateData,
            options: { new: true }
        });

        if (!updatedUser) {
            throw new BadRequestException('Failed to update profile');
        }

        await redisService.deletekey(`user:profile:${userId}`);

        return updatedUser;
    }

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

    toUserResponse(user: IUser): any {
        const userObject = typeof (user as any).toJSON === 'function' ? (user as any).toJSON() : user;
        const { password, __v, ...userWithoutSensitive } = userObject;
        
        return {
            ...userWithoutSensitive,
            fullName: `${user.firstName} ${user.lastName}`,
            isEmailConfirmed: !!user.confirmEmail,
        };
    }


    
    async logout ({flag}:{flag:LogoutEnum},user:HydratedDocument<IUser>,{jti,iat , sub}:{jti:string,iat:number , sub:string}):Promise<number>{ 
        let status = 200
        switch (flag) {
            case LogoutEnum.ALL:
                user.changeCredentialTime = new Date()
                await user.save()
                await this.redis.deletekey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)))
                break;
                
            default:
                await this.token.createRevokeToken({
                userId:sub,
                jti,
                ttl : iat +31104000
        })
                status = 201
                break;
        }
        return status
    }
    
    async rotateToken (user:HydratedDocument<IUser>,{jti,iat,sub}:{jti:string,iat:number , sub:string}){
        if ((iat +3600 ) * 1000 >= Date.now() + (30000)) {
            throw new ConflictException('current access token still valid ')
        }
        await this.token.createRevokeToken({
            userId:sub,
            jti,
            ttl : iat +31104000
        })
        
        return this.token.createLoginCredentials(user)
}
}

export default new UserService();