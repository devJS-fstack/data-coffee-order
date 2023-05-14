import { SizeProduct } from "./sizeProduct.entity";

export const sizeProductProviders = [
    {
        provide: "SIZE_PRODUCT_REPOSITORY",
        useValue: SizeProduct,
    },
];
