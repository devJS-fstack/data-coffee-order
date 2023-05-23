import { Table, Column, Model, AutoIncrement, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { Role } from "./role.entity";

@Table({ name: { singular: "User" }, timestamps: false })
export class User extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Column({ field: "first_name" })
    firstName: string;

    @Column({ field: "last_name" })
    lastName: number;

    @Column({ field: "phone_number" })
    phoneNumber: string;

    @Column
    email: string;

    @Column
    password: string;

    @Column
    status: string;

    @ForeignKey(() => Role)
    @Column({ field: "role_id" })
    roleId: number;

    @Column({ defaultValue: false })
    deleted: boolean;

    @Column({ field: "deleted_at" })
    deletedAt: string;
}
