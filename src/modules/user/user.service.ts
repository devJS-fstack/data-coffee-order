import { Injectable, Inject, HttpException, BadRequestException } from "@nestjs/common";
import { User } from "./user.entity";
import { Vigenere } from "src/utils/vigenere";
import { sendEmail, encodeAes, decodeAes } from "src/utils/helper";
import { WelcomeEmail } from "src/mail/template";
import { BaseAuthentication } from "src/auth";

@Injectable()
export class UserService {
    private vigenere = new Vigenere();
    constructor(
        @Inject("USERS_REPOSITORY")
        private userRepository: typeof User,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.findAll<User>();
    }

    async signUp(user: User) {
        const { password, email, phoneNumber, firstName, lastName } = user;
        console.log(phoneNumber);
        const hashPassword = encodeAes(password, process.env.SECRET_KEY);

        try {
            await this.userRepository.create(
                {
                    email,
                    phoneNumber,
                    password: hashPassword,
                    firstName,
                    lastName,
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
        return newUser;
    }

    async signIn({ email, password }: { email: string; password: string }) {
        const isExist = await this.userRepository.findOne({ where: { email } });

        if (!isExist) {
            throw new BadRequestException("Email is not existed. Please try another !");
        }

        const reHashPassword = decodeAes(isExist.password, process.env.SECRET_KEY);
        const isCorrect = reHashPassword === password;

        if (!isCorrect) {
            throw new BadRequestException("Password is not correctly. Please try again !");
        }

        const accessToken = new BaseAuthentication().generateToken(isExist.dataValues);
        return {
            ...isExist.dataValues,
            accessToken,
            password: undefined,
        };
    }
}
