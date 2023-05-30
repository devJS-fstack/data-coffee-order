import { Topping } from "./topping.entity";
import { IProductTopping } from "../product-topping";

export const toppingProviders = [
    {
        provide: "TOPPINGS_REPOSITORY",
        useValue: Topping,
    },
    {
        provide: "PRODUCT_TOPPING_REPOSITORY",
        useValue: IProductTopping,
    },
];
