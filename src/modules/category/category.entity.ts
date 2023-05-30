import { Table, Column, Model, AutoIncrement, PrimaryKey } from "sequelize-typescript";

@Table({ name: { singular: "Category" }, timestamps: false })
export class Category extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column({ field: "name_category" })
    nameCategory: string;

    @Column({ field: "fav_icon" })
    favIcon: string;

    @Column
    description: string;

    @Column({ defaultValue: true })
    enable: boolean;

    @Column({ defaultValue: false })
    deleted: boolean;

    @Column({ field: "deleted_at" })
    deletedAt: string;
}
