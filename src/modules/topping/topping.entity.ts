import { Table, Column, Model, AutoIncrement, PrimaryKey } from "sequelize-typescript";

@Table({ name: { singular: "Topping" }, timestamps: false })
export class Topping extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column({ field: "name_topping" })
    nameTopping: string;

    @Column
    price: number;

    @Column({ defaultValue: true })
    enable: boolean;

    @Column({ defaultValue: false })
    deleted: boolean;

    @Column({ field: "deleted_at" })
    deletedAt: string;
}
