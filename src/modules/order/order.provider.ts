import { Product } from "../product/product.entity";
import { SizeProduct } from "../size-product/sizeProduct.entity";
import { Topping } from "../topping/topping.entity";
import { Voucher } from "../voucher/voucher.entity";
import { Order } from "./order.entity";
import { OrderProductDetail } from "./orderProductDetail.entity";
import { OrderToppingDetail } from "./orderToppingDetail.entity";

export const orderProviders = [
    {
        provide: "ORDERS_REPOSITORY",
        useValue: Order,
    },
    {
        provide: "ORDER_PRODUCTS_REPOSITORY",
        useValue: OrderProductDetail,
    },
    {
        provide: "ORDER_TOPPINGS_REPOSITORY",
        useValue: OrderToppingDetail,
    },
    {
        provide: "PRODUCTS_REPOSITORY",
        useValue: Product,
    },
    {
        provide: "TOPPINGS_REPOSITORY",
        useValue: Topping,
    },
    {
        provide: "VOUCHERS_REPOSITORY",
        useValue: Voucher,
    },
    {
        provide: "SIZE_PRODUCT_REPOSITORY",
        useValue: SizeProduct,
    },
];
