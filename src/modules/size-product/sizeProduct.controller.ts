import { Controller, Get, Res } from "@nestjs/common";
import { SizeProductService } from "./sizeProduct.service";

@Controller("size-products")
export class SizeProductController {
    constructor(private readonly sizeProductService: SizeProductService) {}
    @Get("")
    async getSizeProduct(@Res() res) {
        const data = await this.sizeProductService.findByProductId(1);
        res.status(200).json({
            message: "success",
            data,
        });
    }
}
