import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { ITopping } from "./index";
import { STORE_PROCEDURES, STATUS_ACCOUNTS } from "src/utils/constant";
import { IProductTopping } from "../product-topping";
import { Op } from "sequelize";
import moment from "moment";

@Injectable()
export class ToppingService {
    constructor(
        @Inject("TOPPINGS_REPOSITORY")
        private toppingRepository: typeof ITopping,
        @Inject("PRODUCT_TOPPING_REPOSITORY")
        private productToppingRepository: typeof IProductTopping,
    ) {}

    async findAll() {
        const toppings = await this.toppingRepository.findAll({ where: { deleted: false } });
        return Promise.all(
            toppings.map(async (topping) => {
                const productToppings = await this.productToppingRepository.findAll({
                    where: { toppingId: topping.id },
                    attributes: ["productId"],
                });
                return {
                    ...topping.dataValues,
                    productIds: productToppings.map((productTopping) => productTopping.productId),
                };
            }),
        );
    }

    async create({
        nameTopping,
        price,
        productIds,
    }: {
        nameTopping: string;
        price: number;
        productIds?: number[];
    }) {
        const existName = await this.toppingRepository.findOne({
            where: {
                nameTopping,
                deleted: false,
            },
        });
        if (existName) {
            throw new BadRequestException("Name topping already in use.");
        }
        const toppingDoc = await this.toppingRepository.create({
            nameTopping,
            price,
        });
        if (productIds?.length) {
            const dataMapped = productIds.map((productId) => ({
                productId,
                toppingId: toppingDoc.id,
            }));
            await this.productToppingRepository.bulkCreate(dataMapped);
        }
    }

    async update({
        nameTopping,
        price,
        productIds,
        toppingId,
    }: {
        nameTopping: string;
        price: number;
        productIds?: number[];
        toppingId: number;
    }) {
        const existName = await this.toppingRepository.findOne({
            where: {
                nameTopping,
                deleted: false,
                id: {
                    [Op.ne]: toppingId,
                },
            },
        });
        if (existName) {
            throw new BadRequestException("Name topping already in use.");
        }
        const [countUpdate] = await this.toppingRepository.update(
            {
                nameTopping,
                price,
            },
            { where: { id: toppingId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Topping is not existed");
        }
        await this.productToppingRepository.destroy({ where: { toppingId } });
        if (productIds?.length) {
            const dataMapped = productIds.map((productId) => ({
                productId,
                toppingId,
            }));
            await this.productToppingRepository.bulkCreate(dataMapped);
        }
    }

    async updateStatus(toppingId: number, status: string) {
        const [countUpdate] = await this.toppingRepository.update(
            {
                enable: status === STATUS_ACCOUNTS.ACTIVE,
            },
            { where: { id: toppingId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Topping is not existed");
        }
    }

    async deleteOne(toppingId: number) {
        const [countUpdate] = await this.toppingRepository.update(
            {
                deleted: true,
                deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { where: { id: toppingId } },
        );

        await this.productToppingRepository.destroy({ where: { toppingId } });

        if (!countUpdate) {
            throw new BadRequestException("Topping is not existed");
        }
    }
}
