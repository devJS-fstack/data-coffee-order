import { Product } from "./product.entity";

export const productProviders = [
    {
        provide: "PRODUCTS_REPOSITORY",
        useValue: Product,
    },
];
