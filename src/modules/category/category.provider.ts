import { Category } from "./category.entity";

export const categoryProviders = [
    {
        provide: "CATEGORIES_REPOSITORY",
        useValue: Category,
    },
];
