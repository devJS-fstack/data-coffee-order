import { Controller, Get, Res, Query, ParseIntPipe, Param } from "@nestjs/common";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}
    @Get("")
    async getProducts(
        @Res() res,
        @Query("offset", ParseIntPipe) offset: number,
        @Query("limit", ParseIntPipe) limit: number,
        @Query("categoryId", ParseIntPipe) categoryId: number,
    ) {
        const { data, total } = await this.productService.getProducts({
            categoryId,
            limit,
            offset,
        });
        res.status(200).json({
            message: "success",
            data,
            total,
        });
    }

    @Get("/:id")
    async getProduct(@Res() res, @Param("id", ParseIntPipe) id: number) {
        const data = await this.productService.getProductById(id);
        res.status(200).json({
            message: "success",
            data,
        });
    }
}
