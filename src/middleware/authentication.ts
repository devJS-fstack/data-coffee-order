import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { BaseAuthentication } from "src/auth";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.headers.authorization?.replace("Bearer ", "");
        const isAuthorized = new BaseAuthentication().verify(accessToken);

        if (!isAuthorized) {
            throw new UnauthorizedException();
        }
        next();
    }
}
