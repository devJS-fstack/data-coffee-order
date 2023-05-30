import { Category } from "../category/category.entity";
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
];
