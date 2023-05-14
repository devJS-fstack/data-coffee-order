import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { IProduct } from "../product";

@Table({ name: { singular: "SizeProduct" }, timestamps: false })
export class SizeProduct extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column
    size: string;

    @Column
    price: number;

    @ForeignKey(() => IProduct)
    @Column({ field: "product_id" })
    productId: number;
}
