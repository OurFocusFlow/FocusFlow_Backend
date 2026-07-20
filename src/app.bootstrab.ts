import express from 'express'
import type  { NextFunction  ,Request, Response } from 'express'
import { authRouter, userRouter } from './modules';
import { globalErrorHandler } from './middlewares/error.middleware'
import { PORT } from './config/config'
import connectdb from './DB/connection.db'
import { redisService } from './common/index'
import cors from "cors";
const bootstrab =async ():Promise<void>=>{
    const app:express.Express = express()
    app.use(cors(),express.json())
    app.get("/",(req:Request,res:Response,next:NextFunction):Response=>{
        return res.status(200).json({message:'landing api '})
    })

    // app routing
    app.use("/auth", authRouter);
    app.use('/user', userRouter);
    app.get("/*dummy",(req:Request,res:Response,next:NextFunction):Response=>{
        return res.status(404).json({message:'invalid app routing '})
    })
    // connect with db 
    await connectdb()
    await redisService.connect()
    // app error handler 
    app.use(globalErrorHandler)
    app.listen(PORT,()=>{
        console.log(`server run on port ${PORT}`);
        
    })

    console.log('app bootstrab succeccfully ');
    
}


export default bootstrab