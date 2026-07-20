import { IUser } from "../../common/index";
import { UserModel } from "../models/user.model";
import { DatabaseRepository } from "./base.repository";



export class UserReposiroty extends  DatabaseRepository<IUser>{
    constructor(){
        super(UserModel)
    }
}