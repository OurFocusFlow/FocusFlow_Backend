
import { ConfirmEmailDto, LoginDto, SignupDto } from "./auth.dto"

import { UserReposiroty } from "../../DB/repository/user.repository";
import { BadRequestException, ConflictException, NotFoundException, ProviderEnum, redisService, RedisService } from "../../common/index";
import { compareHash, generateHash } from "../../common/utils/index";
import { sendEmail } from "../../common/utils/email/send.email";
import { emailTemplate } from "../../common/utils/email/templete.email";
import { createOtp } from "../../common/utils/otp";
import { emailEvent } from "../../common/utils/email/event.email";
import { EmailEnum } from "../../common/enums/email.enum";
import { TokenService } from "../../common/services/token.service";
import { ILoginResponse } from "./auth.entity";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { CLIENT_ID } from "../../config/config";

export class AuthenticationService {
    private userRepository : UserReposiroty
    private redis :RedisService
    private tokenService:TokenService
    constructor(){
        this.userRepository = new UserReposiroty()
        this.redis = redisService
        this.tokenService = new TokenService()

    }
    async login({email,password}:LoginDto,):Promise<ILoginResponse>{
        const user = await this.userRepository.findOne({filter:{email,confirmEmail:{$exists:true},provider:ProviderEnum.SYSTEM}})
        if (!user) {
            throw new NotFoundException('cannot found this account')
        }
        
            const match = await compareHash({plainText:password,ciphertext:user?.password as string })
            if (!match) {
                throw new NotFoundException(`user not found ` )
                
            }
        return await this.tokenService.createLoginCredentials(user)
    }





    private async sendEmailOtp({email,subject,title}:{email:string,subject:EmailEnum,title:string}) {
        const isblocked = await this.redis.ttl(this.redis.blockOtpKey({email,subject}))
        if (isblocked > 0) {
            throw new BadRequestException(`sorry we can not request new otp while you are blocked please try again afte  ${isblocked}`)
        }
        const remainingOtpTTl = await this.redis.ttl(this.redis.otpKey({email,subject}))
        if (remainingOtpTTl > 0) {
            throw new BadRequestException(`sorry we can not request new otp until frist one get exp please try again after ${remainingOtpTTl}`)
        }
        const maxtry = parseInt(await this.redis.get(this.redis.maxTryOtpKey({email,subject})) ?? '0') || 0
        if (maxtry  >= 3) {
            await this.redis.set({
                key : this.redis.blockOtpKey({email,subject}),
                value:1,
                ttl:7*60
            })
            throw new BadRequestException(`sorry we can not request new otp while you have reatched the limit `);
        }

        const code = createOtp()
        await this.redis.set({
            key:this.redis.otpKey({email,subject}),
            value:await generateHash({plainText :`${code}`}),
            ttl:180
        })
        
        emailEvent.emit("sendEmail" , async () => {
            await sendEmail({
                to:email,
                subject,
                html:emailTemplate({title,otp:code.toString()})
            })
            // await this.redis.incr(this.redis.maxTryOtpKey({email,subject}))
        })
    }





    async confirmEmail({email,otp}:ConfirmEmailDto){
        const account = await this.userRepository.findOne({filter:{email,confirmEmail:{$exists:false},provider:ProviderEnum.SYSTEM}})
        if (!account) {
            throw new NotFoundException(`fail to find matching account ` )
        }
        const hashOtp = await this.redis.get(this.redis.otpKey({email,subject:EmailEnum.CONFIRM_EMAIL}) )
        if (!hashOtp) {
            throw new NotFoundException("expired otp ")
            
        }
                if (!await compareHash({plainText : otp , ciphertext:hashOtp })) {
            throw new ConflictException("invalid otp ")
        }
        account.confirmEmail = new Date()
        await account.save()
        await this.redis.deletekey(await this.redis.keys(this.redis.otpKey({email})))
        return ;

    }




    async  resendConfirmEmail({email}:{email:string}) {
        const account = await this.userRepository.findOne({filter:{email, confirmEmail : {$exists :false},provider:ProviderEnum.SYSTEM}})
        if (!account) {
            throw new NotFoundException(`fail to find matching account ` )
        }
        await this.sendEmailOtp({email,subject:EmailEnum.CONFIRM_EMAIL,title:"resend confirm email"})
    }




    async signup({email,username,password}:SignupDto):Promise<any>{
    const checkUserExist = await this.userRepository.findOne({filter:{
        email:email
    }})
    if (checkUserExist) {
        throw new ConflictException('email exist ')
    }
    const user = await this.userRepository.createOne({data:{email,username,password : await generateHash({plainText:password})}})
    if (!user) {
        throw new BadRequestException('fail to signup')
    }
    this.sendEmailOtp({email,subject:EmailEnum.CONFIRM_EMAIL,title:'verify email'})
    return user.toJSON()
}

    async  verifyGoogleAcc(idToken:string):Promise<TokenPayload>{
        
    const client = new OAuth2Client();
    
    const ticket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID, 
    });
    const payload = ticket.getPayload();
        if (!payload?.email_verified) {
                    throw new BadRequestException('fail to verify by google')
                
            }
            return payload
}



    async loginWithGmail(idToken:string){
            const payload = await this.verifyGoogleAcc(idToken)
        const user = await this.userRepository.findOne({filter:{email:payload.email as string,provider:ProviderEnum.GOOGLE}} )
        if (!user) {
            throw new NotFoundException('not register account ')
        }

            return await this.tokenService.createLoginCredentials(user)
    }


    async signUpWithGmail(idToken:string){
            const payload = await this.verifyGoogleAcc(idToken)
        const checkExist = await this.userRepository.findOne({filter:{email:payload.email as string}} )
        if (checkExist) {
            if (checkExist.provider != ProviderEnum.GOOGLE) {
                throw new ConflictException('invalid provider')
            }
            return {status:200,credentials:await this.loginWithGmail(idToken)}
        }
        const user = await this.userRepository.createOne({data:
            {
                email:payload.email as string,
                firstName:payload.given_name as string
                ,lastName:payload.family_name as string,
                profilePicture:payload.picture as string,
                confirmEmail:new Date(),
                provider:ProviderEnum.GOOGLE
            }})
            return {status:201,credentials:await this.tokenService.createLoginCredentials(user)}
    }

    async requestForgotPasswordOtp({email}:{email:string}):Promise<void>  {

    const account = await this.userRepository.findOne(
        { filter:{email , confirmEmail : {$exists :true},provider : ProviderEnum.SYSTEM}})
    if (!account) {
        throw new NotFoundException(`fail to find matching account `)
    }
    await this.sendEmailOtp({email,subject:EmailEnum.FORGOT_PASSWORD,title:'reset code '})
    return ;
}

    async resetForgotPasswordOtp  ({email,otp,password}:{email:string,otp:string,password:string}){
    await this.verifyForgotPasswordOtp({email,otp})
        const account = await this.userRepository.findOneAndUpdate({
            filter:{email , confirmEmail : {$exists :true},provider : ProviderEnum.SYSTEM},
        update:{
            password : await generateHash({plainText:password , salt:15}),
            changeCredentialsTime:new Date()
        }
        })
        if (!account) {
            throw new NotFoundException('account not found ')
        }
        await this.redis.deletekey(await this.redis.keys(this.redis.baseRevokeTokenKey(account._id)))
        await this.redis.deletekey(await this.redis.keys(this.redis.otpKey({email,subject:EmailEnum.FORGOT_PASSWORD})))
        return ;
}


    async verifyForgotPasswordOtp({email,otp}:{email:string,otp:string}){
    const hashOtp =await this.redis.get(this.redis.otpKey({email,subject:EmailEnum.FORGOT_PASSWORD}))
    if (!hashOtp) {
        throw new NotFoundException(`otp is expired`)
    }
    if (!await compareHash({plainText:otp,ciphertext:hashOtp})) {
        throw new ConflictException('conflict otp ')
    }
    
    return ;
}

}


export default new AuthenticationService()