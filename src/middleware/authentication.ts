import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { BaseAuthentication } from "src/auth";

export interface ICurrentUser {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    iat: number;
    exp: number;
}
export interface IRequest extends Request {
    currentUser: ICurrentUser;
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    use(req: IRequest, res: Response, next: NextFunction) {
        const baseAuthentication = new BaseAuthentication();
        const accessToken = req.headers.authorization?.replace("Bearer ", "");
        const isAuthorized = baseAuthentication.verify(accessToken);

        if (!isAuthorized) {
            throw new UnauthorizedException();
        }

        const currentUser = baseAuthentication.parseToken(accessToken);
        req.currentUser = currentUser;
        next();
    }
}
