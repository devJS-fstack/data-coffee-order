import { Controller, Get, Res } from "@nestjs/common";
import { ToppingService } from "./topping.service";

@Controller("toppings")
export class ToppingController {
    constructor(private readonly toppingService: ToppingService) {}
    @Get("/init")
    async initData(@Res() res) {
        await this.toppingService.initData();
        res.status(200).json({
            message: "success",
        });
    }
}
