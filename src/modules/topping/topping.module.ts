import { Module } from "@nestjs/common";
import { ToppingController } from "./topping.controller";
import { ToppingService } from "./topping.service";
import { toppingProviders } from "./topping.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [ToppingController],
    providers: [ToppingService, ...toppingProviders],
})
export class ToppingModule {}
