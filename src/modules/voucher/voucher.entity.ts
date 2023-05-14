import { Table, Column, Model, AutoIncrement, PrimaryKey } from "sequelize-typescript";

@Table({ name: { singular: "Voucher" }, timestamps: false })
export class Voucher extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column
    code: string;

    @Column
    type: string;

    @Column({ field: "name_voucher" })
    nameVoucher: string;

    @Column
    description: string;

    @Column({ field: "percent_discount" })
    percentDiscount: number;

    @Column({ field: "price_discount" })
    priceDiscount: number;

    @Column({ field: "min_payment" })
    minPayment: number;

    @Column({ field: "max_discount" })
    maxDiscount: number;

    @Column({ field: "date_expired" })
    dateExpired: Date;

    @Column({ field: "date_start" })
    dateStart: Date;

    @Column({ field: "limit_use" })
    limitUse: number;

    @Column
    status: string;
}
