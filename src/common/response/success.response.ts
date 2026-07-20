import {type Response } from "express"

export const successRespone = <T>(
    {
        res,
        message = 'Done',
        status = 200 ,
        data
    }
    :
    {
        res:Response,
        message?:string,
        status?:number,
        data?:T
    }
)=>{
    return res.status(status).json({message,status,data})
}