import { Topping } from "./topping.entity";
import { IProductTopping } from "../product-topping";
import { IOrderToppingDetail } from "../order";

export const toppingProviders = [
    {
        provide: "TOPPINGS_REPOSITORY",
        useValue: Topping,
    },
    {
        provide: "PRODUCT_TOPPING_REPOSITORY",
        useValue: IProductTopping,
    },
    {
        provide: "ORDER_TOPPINGS_REPOSITORY",
        useValue: IOrderToppingDetail,
    },
];
