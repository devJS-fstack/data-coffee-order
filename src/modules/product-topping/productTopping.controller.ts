import { Controller, Get, Res } from "@nestjs/common";
import { ProductToppingService } from "./productTopping.service";

@Controller("product-toppings")
export class ProductToppingController {
    constructor(private readonly productToppingService: ProductToppingService) {}
    @Get("/init")
    async initData(@Res() res) {
        await this.productToppingService.initData();
        res.status(200).json({
            message: "success",
        });
    }
}
