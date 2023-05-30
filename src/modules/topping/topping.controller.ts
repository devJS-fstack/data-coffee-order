import {
    Controller,
    Get,
    Res,
    Post,
    Body,
    Put,
    ParseIntPipe,
    Param,
    Patch,
    Delete,
} from "@nestjs/common";
import { ToppingService } from "./topping.service";
import { delay } from "src/utils/helper";

@Controller("toppings")
export class ToppingController {
    constructor(private readonly toppingService: ToppingService) {}
    @Get("/")
    async get(@Res() res) {
        res.status(200).json({
            message: "success",
            data: await this.toppingService.findAll(),
        });
    }

    @Post("/")
    async createTopping(@Res() res, @Body() body) {
        await this.toppingService.create(body);
        res.status(200).json({
            message: "success",
        });
    }

    @Put("/:toppingId")
    async updateTopping(
        @Res() res,
        @Body() body,
        @Param("toppingId", ParseIntPipe) toppingId: number,
    ) {
        await this.toppingService.update({ ...body, toppingId });
        res.status(200).json({
            message: "success",
        });
    }

    @Patch("/:toppingId/status/:status")
    async updateStatus(
        @Res() res,
        @Param("toppingId", ParseIntPipe) toppingId: number,
        @Param("status") status: string,
    ) {
        await this.toppingService.updateStatus(toppingId, status);
        res.status(200).json({
            message: "success",
        });
    }

    @Delete("/:toppingId")
    async deleteTopping(@Res() res, @Param("toppingId", ParseIntPipe) toppingId: number) {
        await this.toppingService.deleteOne(toppingId);
        res.status(200).json({
            message: "success",
        });
    }
}
