import { Injectable, Inject } from "@nestjs/common";
import { IVoucher } from "./index";
import { Op } from "sequelize";
import { VOUCHER_TYPES } from "src/utils/constant";
import { delay } from "src/utils/helper";

@Injectable()
export class VoucherService {
    constructor(
        @Inject("VOUCHERS_REPOSITORY")
        private voucherRepository: typeof IVoucher,
    ) {}

    async getActiveVouchers() {
        return this.voucherRepository.findAll({
            where: {
                dateExpired: {
                    [Op.gte]: new Date(),
                },
                dateStart: {
                    [Op.lte]: new Date(),
                },
            },
            order: [["dateExpired", "ASC"]],
        });
    }

    async createVoucher(voucher: IVoucher) {
        return this.voucherRepository.create({
            ...voucher,
            code: `TCF${Date.now()}`,
            status: "ACTIVE",
        });
    }

    async getDiscountByVoucher({ code, totalPayment }: { totalPayment: number; code: string }) {
        await delay(500);
        const voucherDetail = await this.voucherRepository.findOne({
            where: {
                code,
            },
        });
        if (!voucherDetail) {
            return 0;
        }
        const { minPayment, priceDiscount, type, percentDiscount, maxDiscount } = voucherDetail;
        if (totalPayment >= minPayment) {
            switch (type) {
                case VOUCHER_TYPES.PRICE_DISCOUNT:
                    return priceDiscount;
                case VOUCHER_TYPES.PERCENT_DISCOUNT:
                    const discount = (totalPayment * percentDiscount) / 100;
                    if (discount > maxDiscount) {
                        return maxDiscount;
                    }
                    return discount;
                default:
                    break;
            }
        }

        return 0;
    }

    async getAllVoucher() {
        return this.voucherRepository.findAll({ where: { deleted: false } });
    }
}
