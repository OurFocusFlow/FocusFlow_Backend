import { Router, type Request, type Response, type NextFunction } from "express";
import userService from "./user.service";
import { successRespone } from "../../common/response/success.response";
import { IUserProfileResponse } from "./user.entity";
import * as validators from "./user.validation";
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { UnAuthorizedException } from "../../common/exceptions/domain.exceptions";
import { authentication } from "../../middlewares/auth.middleware.js";
import { TokenTypeEnum } from "../../common/index.js";

const router = Router();

router.get(
    "/profile",
    authentication(),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const user = await userService.getProfile(req.user);
        
        return successRespone({res,message: 'Profile retrieved successfully',data: user });
    }
);

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

// /**
//  * PATCH /users/password
//  * Update user password
//  */
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

// /**
//  * DELETE /users/profile
//  * Delete user account
//  */
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

router.post("/profile/rotate" ,authentication(TokenTypeEnum.REFRESH), async(req,res,next)=>{
    const result  = await userService.rotateToken(req.user,req.decoded as {jti:string,iat:number , sub:string})
    return successRespone({res,data:{result}})
})
router.post("/logout" ,authentication(), async(req,res,next)=>{
    const status  = await userService.logout(req.body,req.user,req.decoded as {jti:string,iat:number , sub:string})
    return successRespone({res,data:{status}})
})

export default router;