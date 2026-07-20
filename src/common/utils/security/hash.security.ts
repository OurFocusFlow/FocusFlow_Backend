import { compare, hash } from "bcrypt"
import { SALT_ROUND } from "../../../config/config"

export const generateHash = async ({plainText,salt =SALT_ROUND }:{plainText:string,salt?:number}):Promise<string> => {
    return await hash(plainText,salt)
}

export const compareHash = async ({plainText,ciphertext }:{plainText:string,ciphertext:string}):Promise<boolean> => {
    return await compare(plainText,ciphertext)
}