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
    @Column
    product_id: number;

    @ForeignKey(() => ITopping)
    @Column
    topping_id: number;
}
