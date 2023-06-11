import { VOUCHER_TYPES } from "src/utils/constant";
import { validateString, validateNumber, validateDate, validateEnumString } from "./common";
import * as Joi from "joi";

export const createVoucherSchema = Joi.object({
    nameVoucher: validateString("nameVoucher"),
    discount: validateNumber("discount"),
    minPayment: validateNumber("minPayment"),
    maxDiscount: validateNumber("maxDiscount"),
    dateExpired: validateDate("dateExpired"),
    dateStart: validateDate("dateStart"),
    limitUse: validateNumber("limitUse"),
    type: validateEnumString(Object.values(VOUCHER_TYPES), "type"),
});
