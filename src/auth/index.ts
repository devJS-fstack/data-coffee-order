import jwt from "jsonwebtoken";
import { IUser } from "src/modules/user";

export class BaseAuthentication {
    generateToken(user: IUser) {
        delete user.password;
        return jwt.sign(
            {
                ...user,
            },
            "private key",
            { expiresIn: "3m" },
        );
    }

    generateRefreshToken(user: IUser) {
        return jwt.sign(
            {
                uerId: user.id,
            },
            "private key",
            { expiresIn: "1h" },
        );
    }

    verify(accessToken: string) {
        let isAuthorized = true;
        let isExpired = false;
        try {
            jwt.verify(accessToken, "private key");
        } catch (error) {
            isExpired = error.message.includes("expired");
            isAuthorized = false;
        }

        return { isAuthorized, isExpired };
    }

    parseToken(accessToken: string): any {
        return jwt.decode(accessToken);
    }
}
