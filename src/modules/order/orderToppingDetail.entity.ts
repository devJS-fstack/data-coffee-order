import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { ISizeProduct } from "../size-product";
import { IOrder } from ".";
import { IProduct } from "../product";
import { ITopping } from "../topping";

@Table({ name: { singular: "Category" }, timestamps: false })
export class OrderToppingDetail extends Model {
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

    @ForeignKey(() => ITopping)
    @Column({ field: "topping_id" })
    toppingId: number;
}
