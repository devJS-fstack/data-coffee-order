import { Module } from "@nestjs/common";
import { SizeProductController } from "./sizeProduct.controller";
import { SizeProductService } from "./sizeProduct.service";
import { sizeProductProviders } from "./sizeProduct.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [SizeProductController],
    providers: [SizeProductService, ...sizeProductProviders],
})
export class SizeProductModule {}
