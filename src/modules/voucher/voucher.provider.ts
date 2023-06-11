import { Order } from "../order/order.entity";
import { Voucher } from "./voucher.entity";

export const voucherProviders = [
    {
        provide: "VOUCHERS_REPOSITORY",
        useValue: Voucher,
    },
    {
        provide: "ORDERS_REPOSITORY",
        useValue: Order,
    },
];
