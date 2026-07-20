import {type NextFunction,type Request,type Response, Router } from "express";
import authService from "./auth.service";
import { successRespone } from "../../common/response/success.response";
import * as validators from './auth.validation'
import { validationMiddleware } from "../../middlewares/validation.middleware";
import { ILoginResponse } from "./auth.entity";

const router = Router()

router.post('/login',
   validationMiddleware(validators.LoginSchema) 
    ,
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
    
    const token = await authService.login(req.body)
    
    return successRespone<ILoginResponse>({res,data:token})
})
router.post('/signup',
   validationMiddleware(validators.SignupSchema) 
    ,
    async(req:Request,res:Response,next:NextFunction):Promise<Response> =>{
        
        const data = await authService.signup(req.body)
    
    return successRespone<any>({res,data})
})
    router.patch(
    "/confirm-email",
    validationMiddleware(validators.confirmEmailSchema),
    async (req, res, next) => {
    await authService.confirmEmail(req.body);
        return successRespone({ res });
    },
    );
    router.patch(
    "/resend-confirm-email",
    validationMiddleware(validators.resendConfirmEmailSchema),
    async (req, res, next) => {
        await authService.resendConfirmEmail(req.body);
        return successRespone({ res });
    },
    );

export default router