import { GenderEnum, ProviderEnum } from "../enums/user.enum.js"

export interface IUser {
    firstName:string
    lastName:string
    username?:string
    email:string
    password?:string
    phone?:string
    profilePicture:string
    gender:GenderEnum
    provider:ProviderEnum
    confirmEmail:Date

}
