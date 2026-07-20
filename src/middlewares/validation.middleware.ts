import type { NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common/index"
import { ZodError, ZodType } from "zod"


type keyRequestType = keyof Request
type SchemaType = Partial<Record<keyRequestType,ZodType>>
export const validationMiddleware = (Schema:SchemaType)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const issues = []
        for (const key of Object.keys(Schema) as keyRequestType[]) {
            if (!Schema[key]) {
                continue
            }

            const validationResult = Schema[key].safeParse(req[key])
            if (!validationResult.success) {
            const error = validationResult.error as ZodError
            issues.push({key,issue:error.issues.map((issue)=>{return {path:issue.path,message:issue.message}})})
        }
        }
        if (issues.length) {
            throw new BadRequestException('validation error ',{issues})
        }
        next()
    }
} 


