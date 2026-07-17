import { Router, type Request, type Response, type NextFunction } from "express";
import userService from "./user.service";
import { successRespone } from "../../common/response/success.response";
import { IUserProfileResponse } from "./user.entity";
import * as validators from "./user.validation";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { UnAuthorizedException } from "../../common/exceptions/domain.exceptions";

const router = Router();

/**
 * GET /users/profile
 * Get current user profile
 */
router.get(
    "/profile",
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        // Get userId from auth middleware
        const userId = (req as any).user?.id;
        
        if (!userId) {
            throw new UnAuthorizedException('User not authenticated');
        }

        const user = await userService.getProfile(userId);
        const response = userService.toUserResponse(user);
        
        return successRespone<IUserProfileResponse>({
            res,
            message: 'Profile retrieved successfully',
            data: response
        });
    }
);

/**
 * PATCH /users/profile
 * Update user profile
 */
router.patch(
    "/profile",
    validationMiddleware(validators.updateProfileSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            throw new UnAuthorizedException('User not authenticated');
        }

        const updatedUser = await userService.updateProfile(userId, req.body);
        const response = userService.toUserResponse(updatedUser);
        
        return successRespone<IUserProfileResponse>({
            res,
            message: 'Profile updated successfully',
            data: response
        });
    }
);

/**
 * PATCH /users/password
 * Update user password
 */
router.patch(
    "/password",
    validationMiddleware(validators.updatePasswordSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            throw new UnAuthorizedException('User not authenticated');
        }

        await userService.updatePassword(userId, req.body);
        
        return successRespone({
            res,
            message: 'Password updated successfully'
        });
    }
);

/**
 * DELETE /users/profile
 * Delete user account
 */
router.delete(
    "/profile",
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            throw new UnAuthorizedException('User not authenticated');
        }

        await userService.deleteAccount(userId);
        
        return successRespone({
            res,
            message: 'Account deleted successfully'
        });
    }
);

export default router;