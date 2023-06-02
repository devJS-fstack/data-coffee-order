import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { orderProviders } from "./order.provider";
import { DatabaseModule } from "../database/database.module";
import { UserService } from "../user/user.service";
import { userProviders } from "../user/user.provider";

@Module({
    imports: [DatabaseModule],
    controllers: [OrderController],
    providers: [OrderService, UserService, ...orderProviders, ...userProviders],
})
export class OrderModule {}
