import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SizeProductService } from "../size-product/sizeProduct.service";
import { sizeProductProviders } from "../size-product/sizeProduct.provider";
import { productProviders } from "./product.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [ProductController],
    providers: [ProductService, SizeProductService, ...productProviders, ...sizeProductProviders],
})
export class ProductModule {}
