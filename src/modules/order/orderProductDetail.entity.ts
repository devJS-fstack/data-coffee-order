import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { ISizeProduct } from "../size-product";
import { IOrder } from ".";
import { IProduct } from "../product";

@Table({ name: { singular: "OrderProductDetail" }, timestamps: false })
export class OrderProductDetail extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column
    quantity: number;

    @Column({ field: "total_price" })
    totalPrice: number;

    @ForeignKey(() => IOrder)
    @Column({ field: "order_id" })
    orderId: number;

    @ForeignKey(() => IProduct)
    @Column({ field: "product_id" })
    productId: number;

    @ForeignKey(() => ISizeProduct)
    @Column({ field: "size_id" })
    sizeId: number;

    @Column
    updated: string;

    @Column
    status: string;
}
