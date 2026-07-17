import { Request, Response, NextFunction } from "express";
import { UnAuthorizedException } from "../common/exceptions/domain.exceptions";
import jwt from 'jsonwebtoken';
import { USER_ACCESS_TOKEN_SECRET_KEY } from "../config/config";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        throw new UnAuthorizedException('No token provided');
    }

    try {
        const decoded = jwt.verify(token, USER_ACCESS_TOKEN_SECRET_KEY);
        (req as any).user = decoded; // Attach user to request
        next();
    } catch (error) {
        throw new UnAuthorizedException('Invalid or expired token');
    }
};