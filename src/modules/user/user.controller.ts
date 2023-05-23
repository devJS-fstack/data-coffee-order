import {
    Controller,
    Get,
    Res,
    Body,
    Post,
    UsePipes,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { BaseValidationPipe } from "src/validation/base";
import { signUpSchema, updateProfileSchema } from "src/validation/user";

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

    @Patch("/:userId")
    async updateProfile(
        @Body() user: User,
        @Res() res,
        @Param("userId", ParseIntPipe) userId: number,
    ) {
        const newUser = await this.userService.updateProfile(userId, user);
        res.status(200).json({
            message: "success",
            data: newUser,
        });
    }

    @Patch("/:userId/status/:status")
    async updateStatus(
        @Res() res,
        @Param("userId", ParseIntPipe) userId: number,
        @Param("status") status: string,
    ) {
        await this.userService.updateStatusUser(userId, status);
        res.status(200).json({
            message: "success",
        });
    }

    @Delete("/:userId")
    async deleteUser(@Res() res, @Param("userId", ParseIntPipe) userId: number) {
        await this.userService.deleteUser(userId);
        res.status(200).json({
            message: "success",
        });
    }

    @Get()
    async getUsers(@Res() res) {
        res.status(200).json({
            message: "success",
            data: await this.userService.findAll(),
        });
    }

    @Get("/roles")
    async getRoles(@Res() res) {
        res.status(200).json({
            message: "success",
            data: await this.userService.getRoles(),
        });
    }
}
