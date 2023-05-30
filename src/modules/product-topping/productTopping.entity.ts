import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { IProduct } from "../product";
import { ITopping } from "../topping";

@Table({ name: { singular: "ProductTopping" }, timestamps: false })
export class ProductTopping extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @ForeignKey(() => IProduct)
    @Column({ field: "product_id" })
    productId: number;

    @ForeignKey(() => ITopping)
    @Column({ field: "topping_id" })
    toppingId: number;
}
