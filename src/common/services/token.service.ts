import Jwt, { JwtPayload, SignOptions }  from "jsonwebtoken";
import { SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_ACCESS_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_ACCESS_TOKEN_SECRET_KEY } from "../../config/config.js";
import { RoleEnum } from "../enums/user.enum.js";
import { redisService, RedisService } from "./redis.service.js";
import { HydratedDocument, Types } from "mongoose";
import { IUser } from "../interfaces/user.interface.js";
import { randomUUID } from "node:crypto";
import { UserReposiroty } from "../../DB/repository/user.repository.js";
import { TokenTypeEnum } from "../enums/token.enum.js";
import { BadRequestException, UnAuthorizedException } from "../exceptions/domain.exceptions.js";
  

type SignaturesType = {accessSignature:string ,refreshSignature:string }

export class TokenService {
    private readonly userRepository : UserReposiroty
    private readonly redis : RedisService

    constructor(){
        this.userRepository = new UserReposiroty()
        this.redis = redisService
    }
    sign=async({
            payload,
            secret = USER_ACCESS_TOKEN_SECRET_KEY,
            options
        }:{
                payload:object,
                secret?: string,
                options?: SignOptions 
        }):Promise<string>=>{
        return Jwt.sign(payload,secret,options)
    }
    verify=async({
            token,
            secret = USER_ACCESS_TOKEN_SECRET_KEY,
        }:{
                token:string,
                secret?: string,
        }):Promise<JwtPayload>=>{
        return Jwt.verify(token,secret) as JwtPayload
    }

    public detectTokenSignature = async (role:RoleEnum):Promise<SignaturesType>=>{
            let Signatures : SignaturesType
            switch (role) {
                case RoleEnum.ADMIN:
                    Signatures = {
                    accessSignature : SYSTEM_ACCESS_TOKEN_SECRET_KEY,
                    refreshSignature : SYSTEM_REFRESH_ACCESS_TOKEN_SECRET_KEY
                    }
                    break;
                    
                    default:
                    Signatures = {
                    accessSignature : USER_ACCESS_TOKEN_SECRET_KEY,
                    refreshSignature : USER_REFRESH_ACCESS_TOKEN_SECRET_KEY
                    }
                        break;
            }
            return Signatures
    }
   public getSignature = async (tokenType : TokenTypeEnum, SignatureLevel:RoleEnum):Promise<string>=>{
            const Signatures = await this.detectTokenSignature(SignatureLevel)
            let signature;

            switch (tokenType) {
                case TokenTypeEnum.REFRESH:
                    signature = Signatures.refreshSignature
                    break;
                    
                    default:
                        signature = Signatures.accessSignature
                        break;
            }
            return signature
    }
    
    
    
    public decodeToken = async ({token,tokenType = TokenTypeEnum.ACCESS}:{token:string,tokenType?:TokenTypeEnum}):Promise<{
        user:HydratedDocument<IUser>,
        decoded:JwtPayload
    }>=>{
        const decoded = Jwt.decode(token) as JwtPayload
        if (!decoded?.aud?.length) {
            throw new BadRequestException('fail to decode this token')
        }
        const [tokenApporach , signatureLevel] = decoded.aud
        if (tokenApporach == undefined || signatureLevel == undefined) {
            throw new BadRequestException('invalid token  ')
        }
        
        if (tokenType !== tokenApporach as unknown as TokenTypeEnum) {
            throw new BadRequestException('invalid token type ')
        }
        
        if (decoded.jti && await this.redis.get(this.redis.revokeTokenKey({userId:decoded.sub as string , jti : decoded.jti}))) {
            throw new UnAuthorizedException('invalid login session')
        }
        const secret = await this.getSignature(tokenApporach as unknown as TokenTypeEnum,signatureLevel as unknown as RoleEnum)
        
        const verifiedData = await this.verify({token,secret})
        if (!verifiedData.sub) {
            throw new BadRequestException('invalid token payload ')
            
        }
        const user = await this.userRepository.findOne({
            filter:{_id:verifiedData.sub}
        })
        if (!user) {
            throw new UnAuthorizedException('user not found ') 
        }
        if (user.changeCredentialTime && user.changeCredentialTime?.getTime()>= (decoded.iat as number || 0) * 1000) {
            throw new UnAuthorizedException('invalid login session')
        }
        return {user,decoded}
    }
        public createLoginCredentials  = async (user:HydratedDocument<IUser>):Promise<{access_token:string,refresh_token:string}>=>{
            const {refreshSignature,accessSignature } = await this.detectTokenSignature(user.role)
            const jwtid = randomUUID()
            const access_token = await this.sign(
                { payload:{
                sub:user._id
            },
            secret:accessSignature,
            options: {expiresIn : 3600 , audience : [TokenTypeEnum.ACCESS  as unknown as string,user.role as unknown as string] ,jwtid }
        })
            const refresh_token = await this.sign(
                { payload:{
                sub:user._id
            },
            secret:refreshSignature,
            options: {expiresIn : '1y' , audience : [TokenTypeEnum.REFRESH  as unknown as string,user.role as unknown as string] ,jwtid }
        })
        
        return {access_token,refresh_token}
        }
    
            createRevokeToken   = async ({jti,ttl,userId}:{jti:string,ttl:number,userId:Types.ObjectId|string})=>{
            await this.redis.set({key : this.redis.revokeTokenKey({userId, jti}),
            value : jti ,
            ttl, 
        })
            return;
        }
}
