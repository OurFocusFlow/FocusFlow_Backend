import {z} from 'zod'

export const generalValidationFields = {
    username:z.string({error:'user name is required'}).min(2).max(25,{error:'max is 25 char'}),
    email:z.email({error:"invalid email syntax "}),
    password:z.string().min(5,{error:'very small password'}),
    confirmPassword:z.string(),
    otp:z.string({error:'otp is required'}).regex(/^\d{6}$/),
}