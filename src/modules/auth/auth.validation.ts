import {z} from 'zod'
import { generalValidationFields } from '../../common/index'




export const LoginSchema = {
    body:z.strictObject({
        email:generalValidationFields.email,
        password:generalValidationFields.password
    })
}
export const SignupSchema = {
    body:LoginSchema.body.safeExtend({
        username:generalValidationFields.username,
        confirmPassword:generalValidationFields.confirmPassword
    }).refine((data)=>{
        return data.password === data.confirmPassword
    },{error:"password mis match with confirm password"})
}

export const confirmEmailSchema = {
    body:z.strictObject({
        email:generalValidationFields.email,
        otp:generalValidationFields.otp
    })
}

export const resendConfirmEmailSchema = {
    body:z.strictObject({
        email:generalValidationFields.email
    })
}
export const resetForgotPassword = {
    body:z.strictObject({
        email:generalValidationFields.email,
        password:generalValidationFields.password,
        confirmPaasword:generalValidationFields.confirmPassword,
        otp:generalValidationFields.otp

    })
}