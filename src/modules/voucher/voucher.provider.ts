import { Voucher } from "./voucher.entity";

export const voucherProviders = [
    {
        provide: "VOUCHERS_REPOSITORY",
        useValue: Voucher,
    },
];
