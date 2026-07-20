import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";
import { EmailEnum } from "../enums/email.enum";
import { Types } from "mongoose";
type RedisKeyType = {
    email:string,
    subject?:EmailEnum
}
export class RedisService {
    private readonly client : RedisClientType
    constructor(){
        this.client = createClient({url:REDIS_URI})
        this.handleEvent()
    }
    private handleEvent(){
        this.client.on('error',(error)=>{
            console.log(`redis error ::: ${error}`);
            
        })
        this.client.on('ready',()=>{
            console.log(`redis ready ::`);
            
        })
    }
    public async connect(){
        await this.client.connect()
        console.log('REDIS CONNECT SUCCESSFULLY 👀');
        
    }

    set = async ({key,value,ttl}:{key:string,value:any,ttl?:number | undefined}):Promise<string|null> => {
        try {
            let data = typeof value === 'string' ? value : JSON.stringify(value)
            return ttl? await this.client.set(key,data,{EX:ttl}) : await this.client.set(key,data)
        } catch (error) {
            console.log(`fail in radis set operation : ${error}`);
            return null
        }
    }
    update = async ({key,value,ttl}:{key:string,value:string | object,ttl?:number | undefined}) :Promise<string | number | null >  => {
        try {
            if (!await this.client.exists(key)) {
                return 0
            }
            return await this.set({key , value , ttl})
        } catch (error) {
            console.log(`fail in radis update operation : ${error}`);
            return null
        }
    }
    
    get = async (key:string) :Promise<any>=> {
        try {
            try {
                return JSON.parse(await this.client.get(key) as string)
            } catch (error) {
                
                return await this.client.get(key)
            }
        } catch (error) {
            console.log(`fail in radis get operation : ${error}`);
            return ;
            
        }
    }
    ttl = async (key:string):Promise<number> => {
        try {
            return await this.client.ttl(key)
        } catch (error) {
            console.log(`fail in radis ttl operation : ${error}`);
            return -2;
        }
    }
    exists = async (key:string):Promise<number> => {
        try {
            return await this.client.exists(key)
        } catch (error) {
            console.log(`fail in radis exists operation : ${error}`);
            return -2;
        }
    }
    incr = async (key:string):Promise<number> => {
        try {
            return await this.client.incr(key)
        } catch (error) {
            console.log(`fail in radis incr operation : ${error}`);
            return -2;
        }
    }
    expire = async ({key , ttl}:{key:string , ttl:number}):Promise<number> => {
        try {
            return await this.client.EXPIRE(key,ttl)
        } catch (error) {
            console.log(`fail in radis expire operation : ${error}`);
            return 0;
        }}
    mGet = async (keys :string[]):Promise<(string | null)[] | number> => {
        try {
            if (!keys.length) {
                return 0
            }
            return await this.client.mGet(keys)
        } catch (error) {
            console.log(`fail in radis mGet operation : ${error}`);
            return [];
        }
    }
    deletekey = async (key:string | string[]) :Promise<number> => {
        try {
            if (!await this.client.exists(key)) {
                return 0
            }
            return await this.client.del(key)
        } catch (error) {
            console.log(`fail in radis delete operation : ${error}`);
            return 0;
        }
    }
    keys = async (prefix:string):Promise<(string)[]> => {
        try {
            return await this.client.keys(`${prefix}*`) as string[]
        } catch (error) {
            console.log(`fail in radis keys operation : ${error}`);
            return[];
        }
    }
    
    revokeTokenKey = ({userId , jti} : {userId:Types.ObjectId |string , jti:string}):string=>{
        return `revoke::${userId} :: ${jti}`
    } 
    baseRevokeTokenKey = (userId:Types.ObjectId | string ):string=>{
        return `revoke::${userId.toString()}`
    } 
    
    otpKey = ({email,subject=EmailEnum.FORGOT_PASSWORD}:RedisKeyType):string=>{
        return  `otp::user::${email}::${subject}`
    }
    maxTryOtpKey = ({email,subject=EmailEnum.FORGOT_PASSWORD}:RedisKeyType):string=>{
        return  `otp::user::${email}::${subject}::maxtry`
    }
    blockOtpKey = ({email,subject=EmailEnum.FORGOT_PASSWORD}:RedisKeyType):string=>{
        return  `otp::user::${email}::${subject}::block`
    }


    FCM_Key = (userId:Types.ObjectId |string )=>{
        return `user:FCM:${userId.toString()}`;
    }
    async addFCM(userId : Types.ObjectId |string , FCMToken:string){
        return await this.client.sAdd(this.FCM_Key(userId), FCMToken);
    }

    async removeFCM(userId:Types.ObjectId |string , FCMToken:string){
        return await this.client.sRem(this.FCM_Key(userId), FCMToken);
    }

    async getFCMs  (userId:Types.ObjectId |string ){
        return await this.client.sMembers(this.FCM_Key(userId));
    }

    async hasFCMs  (userId:Types.ObjectId |string ){
        return await this.client.sCard(this.FCM_Key(userId));
    }

    async removeFCMUser (userId:Types.ObjectId |string ){
        return await this.client.del(this.FCM_Key(userId));
  }

    SocketKey(userId:Types.ObjectId|string) {
        return `user:sockets:${userId.toString()}`;
    }
    async  addSocket(userId:Types.ObjectId|string, socketId:string) {
        return await this.client.sAdd(this.SocketKey(userId), socketId);
    }

    async  removeSocket(userId:Types.ObjectId|string, socketId:string) {
        return await this.client.sRem(this.SocketKey(userId), socketId);
    }

    async  getSockets(userId:Types.ObjectId|string) {
        return await this.client.sMembers(this.SocketKey(userId));
    }

    async  hasSockets(userId:Types.ObjectId|string) {
        return await this.client.sCard(this.SocketKey(userId));
    }

    async  removeUser(userId:Types.ObjectId|string) {
        return await this.client.del(this.SocketKey(userId));
    }
    }

export const redisService = new RedisService()