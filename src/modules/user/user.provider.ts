import { User } from "./user.entity";

export const userProviders = [
    {
        provide: "USERS_REPOSITORY",
        useValue: User,
    },
];
