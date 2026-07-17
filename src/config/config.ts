import { config } from "dotenv";
import { resolve } from "node:path";
config({path:resolve(`./.env.${process.env.NODE_ENV}`)})
export const PORT = process.env.PORT
export const port = process.env.PORT ?? 7000

export const DB_URI = process.env.DB_URI as string
export const REDIS_URI = process.env.REDIS_URI as string


export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY as string 
export const USER_REFRESH_ACCESS_TOKEN_SECRET_KEY = process.env.USER_REFRESH_ACCESS_TOKEN_SECRET_KEY as string
export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string
export const SYSTEM_REFRESH_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_REFRESH_ACCESS_TOKEN_SECRET_KEY as string
export const EMAIL_App_PASSWORD = process.env.EMAIL_App_PASSWORD as string
export const EMAIL_APP = process.env.EMAIL_APP as string
export const ORIGINS = (process.env.ORIGINS?.split(',') || []) as string[]


export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? '16')
export const ENC_SECRET_KEY = Buffer.from(process.env.ENC_SECRET_KEY as string)



export const AWS_REGION = process.env.AWS_REGION as string
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string
export const AWS_ACCESS_KET_ID = process.env.AWS_ACCESS_KET_ID as string
export const AWS_SECRET_ACCESS_KET_ID = process.env.AWS_SECRET_ACCESS_KET_ID as string
export const AWS_EXPIRES_IN = parseInt(process.env.AWS_EXPIRES_IN as string||"120")
