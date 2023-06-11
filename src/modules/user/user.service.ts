import {
    Injectable,
    Inject,
    HttpException,
    BadRequestException,
    UnauthorizedException,
} from "@nestjs/common";
import { User } from "./user.entity";
import { sendEmail, encodeAes, decodeAes, delay } from "src/utils/helper";
import { WelcomeEmail } from "src/mail/template";
import { BaseAuthentication } from "src/auth";
import { Op } from "sequelize";
import { Role } from "./role.entity";
import { ROLES, STATUS_ACCOUNTS, FORMAT_DATE_TIME } from "src/utils/constant";
import moment from "moment";
import jwt from "jsonwebtoken";

@Injectable()
export class UserService {
    constructor(
        @Inject("USERS_REPOSITORY")
        private userRepository: typeof User,
        @Inject("ROLES_REPOSITORY")
        private roleRepository: typeof Role,
    ) {}

    async findAll(): Promise<User[]> {
        // await delay(2000);
        return this.userRepository.findAll<User>({
            where: {
                deleted: false,
            },
            include: [
                {
                    model: Role,
                },
            ],
            attributes: ["firstName", "lastName", "email", "phoneNumber", "status", "id", "roleId"],
        });
    }

    async signUp(user: User) {
        const { password, email, phoneNumber, firstName, lastName, roleId } = user;
        const hashPassword = encodeAes(password, process.env.SECRET_KEY);
        let queryRole: any = { role: ROLES.USER };
        if (roleId) {
            queryRole = {
                id: roleId,
            };
        }
        const userRole = await this.roleRepository.findOne({ where: queryRole });

        try {
            await this.userRepository.create(
                {
                    email,
                    phoneNumber,
                    password: hashPassword,
                    firstName,
                    lastName,
                    roleId: userRole.id,
                    status: STATUS_ACCOUNTS.ACTIVE,
                },
                { returning: false },
            );
        } catch (error) {
            const message = error?.original?.errors?.[0]?.message;
            if (message) {
                throw new HttpException(message, 400);
            }
        }

        await sendEmail(
            {
                to: email,
                subject: WelcomeEmail.subject,
                html: WelcomeEmail.body,
            },
            {
                name: `${firstName} ${lastName}`,
                email,
                password,
            },
        );

        const newUser = await this.userRepository.findOne({ where: { email } });
        if (!newUser) {
            throw new BadRequestException();
        }

        const accessToken = new BaseAuthentication().generateToken(newUser.dataValues);
        const refreshToken = new BaseAuthentication().generateRefreshToken(newUser);
        return {
            ...newUser.dataValues,
            password: undefined,
            accessToken,
            refreshToken,
        };
    }

    async signIn({ email, password }: { email: string; password: string }) {
        const isExist = await this.userRepository.findOne({
            where: { email },
            include: [{ model: Role }],
        });

        if (!isExist) {
            throw new BadRequestException("Email is not existed. Please try another !");
        }

        const reHashPassword = decodeAes(isExist.password, process.env.SECRET_KEY);
        const isCorrect = reHashPassword === password;

        if (!isCorrect) {
            throw new BadRequestException("Password is not correctly. Please try again !");
        }

        const accessToken = new BaseAuthentication().generateToken(isExist.dataValues);
        const refreshToken = new BaseAuthentication().generateRefreshToken(isExist);

        return {
            ...isExist.dataValues,
            accessToken,
            password: undefined,
            refreshToken,
        };
    }

    async updateProfile(userId: number, user: User) {
        await delay(2000);
        const { firstName, lastName, phoneNumber, roleId } = user;
        const isExistPhone = await this.userRepository.findOne({
            where: {
                phoneNumber,
                id: {
                    [Op.ne]: userId,
                },
            },
        });

        if (isExistPhone) {
            throw new BadRequestException("Phone number is already existed");
        }
        const updateDoc: any = {
            firstName,
            lastName,
            phoneNumber,
        };

        if (roleId) {
            const roleDetail = await this.roleRepository.findByPk(roleId);
            if (!roleDetail) {
                throw new BadRequestException("Unsupported this role");
            }
            updateDoc.roleId = roleId;
        }

        await this.userRepository.update(updateDoc, { where: { id: userId } });
        return this.userRepository.findByPk(userId);
    }

    async getRoles() {
        return this.roleRepository.findAll();
    }

    async updateStatusUser(userId: number, status: string) {
        const countUpdate = await this.userRepository.update(
            {
                status,
            },
            { where: { id: userId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("User is not existed");
        }
    }

    async deleteUser(userId: number) {
        const countUpdate = await this.userRepository.update(
            {
                deleted: true,
                deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { where: { id: userId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("User is not existed");
        }
    }

    async authentication({ role, userId }: { userId: number; role: string }) {
        const userDetail = await this.userRepository.findByPk(userId);
        const roleDetail = await this.roleRepository.findOne({ where: { role } });

        if (userDetail && roleDetail && userDetail.roleId !== roleDetail.id) {
            throw new UnauthorizedException();
        }
    }

    async getNewAccessToken({
        refreshToken,
        accessToken,
    }: {
        refreshToken: string;
        accessToken: string;
    }) {
        try {
            jwt.verify(refreshToken, "private key");
            const result: any = jwt.decode(accessToken);
            delete result.iat;
            delete result.exp;
            const newAccessToken = new BaseAuthentication().generateToken(result);
            const newRefreshToken = new BaseAuthentication().generateRefreshToken(result);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            console.log("Error while refreshing token", error);
            return {};
        }
    }
}
