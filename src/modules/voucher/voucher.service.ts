import { Injectable, Inject } from "@nestjs/common";
import { IVoucher } from "./index";
import { Op } from "sequelize";
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
}
