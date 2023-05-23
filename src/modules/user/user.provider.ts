import { User } from "./user.entity";
import { Role } from "./role.entity";

export const userProviders = [
    {
        provide: "USERS_REPOSITORY",
        useValue: User,
    },
    {
        provide: "ROLES_REPOSITORY",
        useValue: Role,
    },
];
