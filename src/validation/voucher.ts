import { validateString, validateNumber, validateDate } from "./common";
import * as Joi from "joi";

export const createVoucherSchema = Joi.object({
    nameVoucher: validateString("nameVoucher"),
    description: validateString("description"),
    percentDiscount: validateNumber("percentDiscount"),
    priceDiscount: validateNumber("priceDiscount"),
    minPayment: validateNumber("minPayment"),
    maxDiscount: validateNumber("maxDiscount"),
    dateExpired: validateDate("dateExpired"),
    dateStart: validateDate("dateStart"),
    limitUse: validateNumber("limitUse"),
    type: validateString("type"),
});
