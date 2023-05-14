import { ProductTopping } from "./productTopping.entity";

export const productToppingProviders = [
    {
        provide: "PRODUCT_TOPPING_REPOSITORY",
        useValue: ProductTopping,
    },
];
