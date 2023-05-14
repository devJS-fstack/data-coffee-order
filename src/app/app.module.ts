import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "src/modules/user/user.module";
import { CategoryModule } from "src/modules/category/category.module";
import { ProductModule } from "src/modules/product/product.module";
import { ToppingModule } from "src/modules/topping/topping.module";
import { ProductToppingModule } from "src/modules/product-topping/productTopping.module";
import { SizeProductModule } from "src/modules/size-product/sizeProduct.module";
import { VoucherModule } from "src/modules/voucher/voucher.module";
// import { CategoryController } from "src/modules/category/category.controller";
import { AuthenticationMiddleware } from "src/middleware/authentication";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        CategoryModule,
        ProductModule,
        ToppingModule,
        ProductToppingModule,
        SizeProductModule,
        VoucherModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthenticationMiddleware).forRoutes();
    }
}
