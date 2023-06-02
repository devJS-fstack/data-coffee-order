import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { ITopping } from "../topping";
import { OrderProductDetail } from "./orderProductDetail.entity";
import { Topping } from "../topping/topping.entity";
import { IOrder } from ".";

@Table({ name: { singular: "OrderToppingDetail" }, timestamps: false })
export class OrderToppingDetail extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column
    quantity: number;

    @Column({ field: "product_quantity" })
    productQuantity: number;

    @Column({ field: "total_price" })
    totalPrice: number;

    @ForeignKey(() => ITopping)
    @Column({ field: "topping_id" })
    toppingId: number;

    @ForeignKey(() => OrderProductDetail)
    @Column({ field: "product_order_id" })
    productOrderId: number;

    @ForeignKey(() => IOrder)
    @Column({ field: "order_id" })
    orderId: number;

    @Column
    status: string;

    @Column
    updated: string;
}
