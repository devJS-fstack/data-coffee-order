import {
    Table,
    Column,
    Model,
    AutoIncrement,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { ICategory } from "../category";

@Table({ name: { singular: "Product" }, timestamps: false })
export class Product extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column({ field: "name_product" })
    nameProduct: string;

    @Column({ field: "fav_icon" })
    favIcon: string;

    @Column
    description: string;

    @Column
    price: number;

    @ForeignKey(() => ICategory)
    @Column({ field: "category_id" })
    categoryId: number;

    @BelongsTo(() => ICategory)
    category: ICategory;
}
