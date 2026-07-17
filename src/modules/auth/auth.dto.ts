import {z} from "zod"
import { confirmEmailSchema, LoginSchema, SignupSchema } from "./auth.validation"



export type LoginDto = z.infer<typeof LoginSchema.body>
export type SignupDto = z.infer<typeof SignupSchema.body>
export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema.body>