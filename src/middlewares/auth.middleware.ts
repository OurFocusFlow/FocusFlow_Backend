import type { NextFunction, Request, Response } from "express"
import { TokenService } from "../common/services/token.service"
import { TokenTypeEnum } from "../common/enums/token.enum.js"
import {  UnAuthorizedException } from "../common/index.js";



export const authentication = (
tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS
) => {
return async (req: Request, res: Response, next: NextFunction) => {
    const tokenService = new TokenService();

    const [key, credentials] =
    req.headers?.authorization?.split(" ") || [];

    if (!key || !credentials) {
    throw new UnAuthorizedException("Missing auth");
    }

    switch (key) {
    case "basic":
        break;

    default:
        const { decoded, user } = await tokenService.decodeToken({
        token: credentials,
        tokenType,
        });

        req.user = user;
        req.decoded = decoded;
        break;
    }

    next();
};
};


