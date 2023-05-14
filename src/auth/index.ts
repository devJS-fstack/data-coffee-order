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
            { expiresIn: "30m" },
        );
    }

    verify(accessToken: string) {
        let isAuthorized = true;
        try {
            jwt.verify(accessToken, "private key");
        } catch {
            isAuthorized = false;
        }

        return isAuthorized;
    }

    parseToken(accessToken: string): any {
        return jwt.decode(accessToken);
    }
}
