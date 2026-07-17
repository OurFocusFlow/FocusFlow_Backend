import { ApplicationException } from "./app.exceptions.js"

export class BadRequestException extends ApplicationException {
    constructor(messge:string = 'Bad Request',cause?:unknown){
        super(messge,400,cause)
    }
}
export class ConflictException extends ApplicationException {
    constructor(messge:string = 'Conflict',cause?:unknown){
        super(messge,409,cause)
    }
}
export class NotFoundException extends ApplicationException {
    constructor(messge:string = 'NotFound',cause?:unknown){
        super(messge,404,cause)
    }
}
export class UnAuthorizedException extends ApplicationException {
    constructor(messge:string = 'UnAuthorized',cause?:unknown){
        super(messge,401,cause)
    }
}
export class ForbiddenException extends ApplicationException {
    constructor(messge:string = 'Forbidden',cause?:unknown){
        super(messge,403,cause)
    }
}