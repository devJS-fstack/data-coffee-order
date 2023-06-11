import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { IVoucher } from "./index";
import { Op } from "sequelize";
import { STATUS_ACCOUNTS, VOUCHER_TYPES } from "src/utils/constant";
import { delay, uploadImage } from "src/utils/helper";
import moment from "moment";
import { ICurrentUser } from "src/middleware/authentication";
import { IOrder } from "../order";

@Injectable()
export class VoucherService {
    constructor(
        @Inject("VOUCHERS_REPOSITORY")
        private voucherRepository: typeof IVoucher,
        @Inject("ORDERS_REPOSITORY")
        private orderRepository: typeof IOrder,
    ) {}

    async getActiveVouchers(currentUser: ICurrentUser) {
        const vouchers = await this.voucherRepository.findAll({
            where: {
                dateExpired: {
                    [Op.gte]: new Date(),
                },
                dateStart: {
                    [Op.lte]: new Date(),
                },
                enable: true,
                deleted: false,
            },
            order: [["dateExpired", "ASC"]],
        });

        const maxCurrentDate = moment();
        const minCurrentDate = moment();
        maxCurrentDate.hours(23);
        maxCurrentDate.minutes(59);
        maxCurrentDate.seconds(59);
        minCurrentDate.hours(0);
        minCurrentDate.minutes(0);
        minCurrentDate.seconds(0);

        return Promise.all(
            vouchers.map(async (voucher) => {
                const countVoucherByUser = await this.orderRepository.count({
                    where: {
                        voucherId: voucher.id,
                        userId: currentUser.id,
                        orderedDate: {
                            [Op.gte]: minCurrentDate.format("YYYY-MM-DD HH:ss:mm"),
                            [Op.lte]: maxCurrentDate.format("YYYY-MM-DD HH:ss:mm"),
                        },
                    },
                });
                return {
                    ...voucher.dataValues,
                    isLimited: countVoucherByUser === voucher.limitUse,
                };
            }),
        );
    }

    async createVoucher(payload: {
        nameVoucher: string;
        discount: number;
        minPayment: number;
        maxDiscount: number;
        dateExpired: string;
        dateStart: string;
        limitUse: number;
        type: string;
        description: string;
        image: Express.Multer.File;
    }) {
        const { type, discount, image } = payload;
        const voucher: any = { ...payload, discount: undefined, image: undefined };
        switch (type) {
            case VOUCHER_TYPES.PERCENT_DISCOUNT:
                voucher.percentDiscount = discount;
                break;
            case VOUCHER_TYPES.PRICE_DISCOUNT:
                voucher.priceDiscount = discount;
                break;
        }

        if (image) {
            const pathImg = await uploadImage(image, `${Date.now()}`, "voucher");
            voucher.imageUrl = pathImg;
        }

        await this.voucherRepository.create({
            ...voucher,
            code: `TCF${Date.now()}`,
        });
    }

    async updateVoucher(
        payload: {
            voucherId: number;
            nameVoucher: string;
            discount: number;
            minPayment: number;
            maxDiscount: number;
            dateExpired: string;
            dateStart: string;
            limitUse: number;
            type: string;
            description: string;
            image: Express.Multer.File;
        },
        voucherId: number,
    ) {
        const { type, discount, image } = payload;
        const voucher: any = { ...payload, discount: undefined, image: undefined };
        switch (type) {
            case VOUCHER_TYPES.PERCENT_DISCOUNT:
                voucher.percentDiscount = discount;
                break;
            case VOUCHER_TYPES.PRICE_DISCOUNT:
                voucher.priceDiscount = discount;
                break;
        }

        if (image) {
            const pathImg = await uploadImage(image, `${Date.now()}`, "voucher");
            voucher.imageUrl = pathImg;
        }

        const [countUpdate] = await this.voucherRepository.update(
            {
                ...voucher,
            },
            { where: { id: voucherId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Voucher does not existed");
        }
    }

    async updateStatus(voucherId: number, status: string) {
        const countUpdate = await this.voucherRepository.update(
            {
                enable: status === STATUS_ACCOUNTS.ACTIVE,
            },
            { where: { id: voucherId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Category is not existed");
        }
    }

    async deleteOne(voucherId: number) {
        const [countUpdate] = await this.voucherRepository.update(
            {
                deleted: true,
                deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { where: { id: voucherId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Voucher is not existed");
        }
    }

    async getDiscountByVoucher({ code, totalPayment }: { totalPayment: number; code: string }) {
        await delay(500);
        const voucherDetail = await this.voucherRepository.findOne({
            where: {
                code,
                enable: true,
                deleted: false,
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
