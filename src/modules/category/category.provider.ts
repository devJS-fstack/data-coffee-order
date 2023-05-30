import { Category } from "./category.entity";
import { IProduct } from "../product";

export const categoryProviders = [
    {
        provide: "CATEGORIES_REPOSITORY",
        useValue: Category,
    },
    {
        provide: "PRODUCTS_REPOSITORY",
        useValue: IProduct,
    },
];
