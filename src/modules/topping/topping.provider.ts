import { Topping } from "./topping.entity";

export const toppingProviders = [
    {
        provide: "TOPPINGS_REPOSITORY",
        useValue: Topping,
    },
];
