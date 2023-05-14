import { Sequelize } from "sequelize-typescript";
import { User } from "../user/user.entity";
import { Category } from "../category/category.entity";
import { Product } from "../product/product.entity";
import { Topping } from "../topping/topping.entity";
import { ProductTopping } from "../product-topping/productTopping.entity";
import { SizeProduct } from "../size-product/sizeProduct.entity";
import { Voucher } from "../voucher/voucher.entity";

export const databaseProviders = [
    {
        provide: "SEQUELIZE",
        useFactory: async () => {
            const sequelize = new Sequelize({
                dialect: "mssql",
                host: "localhost",
                port: 1433,
                username: "sa",
                password: "215531622",
                database: "coffee-house",
                logging: (query) => {
                    // console.log(query);
                },
            });
            sequelize.addModels([
                User,
                Category,
                Product,
                Topping,
                ProductTopping,
                SizeProduct,
                Voucher,
            ]);
            await sequelize.sync();
            return sequelize;
        },
    },
];
