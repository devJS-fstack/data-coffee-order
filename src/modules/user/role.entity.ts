import { Table, Column, Model, AutoIncrement, PrimaryKey } from "sequelize-typescript";

@Table({ name: { singular: "Role" }, timestamps: false })
export class Role extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column
    role: string;

    @Column({ field: "role_name" })
    roleName: number;
}
