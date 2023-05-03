import { validateString, validateEnumString } from "./common";
import * as Joi from "joi";

export const signUpSchema = Joi.object({
    email: validateString("email"),
    lastName: validateString("lastName"),
    firstName: validateString("firstName"),
    password: validateString("Password"),
    phoneNumber: validateString("Phone number"),
});

export const loginSchema = Joi.object({
    username: Joi.when("typeLogin", {
        is: "DEFAULT",
        then: validateString("username"),
    }),
    password: Joi.when("typeLogin", {
        is: "DEFAULT",
        then: validateString("password"),
    }),
    email: Joi.when("typeLogin", {
        is: Joi.valid("FACEBOOK", "GOOGLE"),
        then: validateString("email"),
    }),
    typeLogin: validateEnumString(["FACEBOOK", "GOOGLE", "DEFAULT"], "typeLogin"),
    fullName: Joi.when("typeLogin", {
        is: Joi.valid("FACEBOOK", "GOOGLE"),
        then: validateString("fullName"),
    }),
    imgUrl: validateString("Image URL").optional(),
});
