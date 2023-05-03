import { Controller, Get, Res, Body, Post, UsePipes } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { BaseValidationPipe } from "src/validation/base";
import { signUpSchema } from "src/validation/user";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Post("sign-in")
    async signIn(@Res() res, @Body() { email, password }: Pick<User, "email" | "password">) {
        const user = await this.userService.signIn({ email, password });
        res.status(200).json({
            message: "success",
            data: user,
        });
    }

    @Post("sign-up")
    @UsePipes(new BaseValidationPipe(signUpSchema))
    async signup(@Body() user: User, @Res() res) {
        const newUser = await this.userService.signUp(user);
        res.status(200).json({
            message: "success",
            data: newUser,
        });
    }
}
