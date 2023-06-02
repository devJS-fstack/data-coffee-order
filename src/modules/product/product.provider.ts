import { Category } from "../category/category.entity";
import { IProductTopping } from "../product-topping";
import { IOrderProductDetail } from "../order";
import { SizeProduct } from "../size-product/sizeProduct.entity";
import { Product } from "./product.entity";

export const productProviders = [
    {
        provide: "PRODUCTS_REPOSITORY",
        useValue: Product,
    },
    {
        provide: "CATEGORIES_REPOSITORY",
        useValue: Category,
    },
    {
        provide: "SIZES_REPOSITORY",
        useValue: SizeProduct,
    },
    {
        provide: "PRODUCT_TOPPING_REPOSITORY",
        useValue: IProductTopping,
    },
    {
        provide: "ORDER_PRODUCTS_REPOSITORY",
        useValue: IOrderProductDetail,
    },
];
