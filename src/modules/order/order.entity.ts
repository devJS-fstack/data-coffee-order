import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { IVoucher } from "../voucher";
import { IUser } from "../user";
import { DATE } from "sequelize";

@Table({ name: { singular: "Category" }, timestamps: false })
export class Order extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column({ field: "name_receiver" })
    nameReceiver: string;

    @Column({ field: "phone_receiver" })
    phoneReceiver: string;

    @Column({ field: "address_receiver" })
    addressReceiver: string;

    @Column({ field: "instruction_address_receiver" })
    instructionAddressReceiver: string;

    @Column({ field: "planned_received_date" })
    plannedReceivedDate: string;

    @Column({ field: "payment_method" })
    paymentMethod: string;

    @Column({ field: "shipping_fee" })
    shippingFee: number;

    @Column({ field: "voucher_discount" })
    voucherDiscount: number;

    @Column({ field: "total_payment" })
    totalPayment: number;

    @Column({ field: "status" })
    status: string;

    @Column({ field: "created" })
    created: string;

    @ForeignKey(() => IVoucher)
    @Column({ field: "voucher_id" })
    voucherId: number;

    @ForeignKey(() => IUser)
    @Column({ field: "user_id" })
    userId: number;
}