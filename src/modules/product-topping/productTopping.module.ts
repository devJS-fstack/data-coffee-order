import { Module } from "@nestjs/common";
import { ProductToppingController } from "./productTopping.controller";
import { ProductToppingService } from "./productTopping.service";
import { productToppingProviders } from "./productTopping.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [ProductToppingController],
    providers: [ProductToppingService, ...productToppingProviders],
})
export class ProductToppingModule {}
