import {
    Controller,
    Get,
    Res,
    Query,
    ParseIntPipe,
    Param,
    UseInterceptors,
    UploadedFile,
    Body,
    Post,
    Put,
    Delete,
    Patch,
    ParseBoolPipe,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileInterceptor } from "@nestjs/platform-express/multer";
import { toNumber } from "lodash";

@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}
    @Get("")
    async getProducts(
        @Res() res,
        @Query("offset", ParseIntPipe) offset: number,
        @Query("limit", ParseIntPipe) limit: number,
        @Query("categoryId") categoryId: number,
        @Query("enable", ParseBoolPipe) enable: boolean,
    ) {
        const { data, total } = await this.productService.getProducts({
            categoryId: categoryId ? toNumber(categoryId) : 0,
            limit,
            offset,
            enable,
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

    @Post("")
    @UseInterceptors(FileInterceptor("favIcon"))
    async createProduct(@Res() res, @UploadedFile() file: Express.Multer.File, @Body() body) {
        const payload = JSON.parse(JSON.stringify(body));
        await this.productService.createProduct({
            ...payload,
            favIcon: file,
            sizes: payload.sizes === "undefined" ? [] : JSON.parse(payload?.sizes),
        });
        res.status(200).json({
            message: "success",
        });
    }

    @Put("/:productId")
    @UseInterceptors(FileInterceptor("favIcon"))
    async updateProduct(
        @Res() res,
        @UploadedFile() file: Express.Multer.File,
        @Body() body,
        @Param("productId", ParseIntPipe) productId: number,
    ) {
        const payload = JSON.parse(JSON.stringify(body));
        console.log(payload.sizes);
        await this.productService.updateProduct({
            ...payload,
            favIcon: file,
            sizes: payload.sizes === "undefined" ? [] : JSON.parse(payload?.sizes),
            productId,
        });
        res.status(200).json({
            message: "success",
        });
    }

    @Delete("/:productId")
    async deleteProduct(@Res() res, @Param("productId", ParseIntPipe) productId: number) {
        await this.productService.deleteProduct(productId);
        res.status(200).json({
            message: "success",
        });
    }

    @Patch("/:productId/status/:status")
    async updateStatus(
        @Res() res,
        @Param("productId", ParseIntPipe) productId: number,
        @Param("status") status: string,
    ) {
        await this.productService.updateStatus(productId, status);
        res.status(200).json({
            message: "success",
        });
    }
}
