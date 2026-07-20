import { GenderEnum, ProviderEnum, RoleEnum } from "../enums/user.enum"

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
    role:RoleEnum
    confirmEmail:Date
    changeCredentialTime:Date

}
