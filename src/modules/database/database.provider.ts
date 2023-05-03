import { Sequelize } from "sequelize-typescript";
import { User } from "src/modules/user/user.entity";

export const databaseProviders = [
    {
        provide: "SEQUELIZE",
        useFactory: async () => {
            const sequelize = new Sequelize({
                dialect: "mssql",
                host: "localhost",
                port: 1433,
                username: "sa",
                password: "215531622",
                database: "coffee-house",
                logging: (query) => {
                    // console.log(query);
                },
            });
            sequelize.addModels([User]);
            await sequelize.sync();
            return sequelize;
        },
    },
];
