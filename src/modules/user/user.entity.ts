import { Table, Column, Model, AutoIncrement, PrimaryKey } from "sequelize-typescript";

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
}
