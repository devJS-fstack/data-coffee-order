import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { ITopping } from "./index";
import { STORE_PROCEDURES, STATUS_ACCOUNTS, STATUS_ORDERS } from "src/utils/constant";
import { IProductTopping } from "../product-topping";
import { IOrderToppingDetail } from "../order";
import { Op } from "sequelize";
import moment from "moment";

@Injectable()
export class ToppingService {
    constructor(
        @Inject("TOPPINGS_REPOSITORY")
        private toppingRepository: typeof ITopping,
        @Inject("PRODUCT_TOPPING_REPOSITORY")
        private productToppingRepository: typeof IProductTopping,
        @Inject("ORDER_TOPPINGS_REPOSITORY")
        private orderToppingRepository: typeof IOrderToppingDetail,
    ) {}

    async findAll({ enable }: { enable: boolean }) {
        const query: any = {
            deleted: false,
        };
        if (enable) {
            query.enable = enable;
        }
        const toppings = await this.toppingRepository.findAll({ where: query });
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

        await this.orderToppingRepository.sequelize.query(
            "UPDATE OrderToppingDetails SET total_price = :price * quantity WHERE topping_id = :toppingId AND status = :status",
            {
                replacements: {
                    price,
                    toppingId,
                    status: STATUS_ORDERS.CREATED,
                },
            },
        );
    }

    async updateStatus(toppingId: number, status: string) {
        const isEnable = status === STATUS_ACCOUNTS.ACTIVE;
        const [countUpdate] = await this.toppingRepository.update(
            {
                enable: isEnable,
            },
            { where: { id: toppingId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Topping is not existed");
        }

        if (isEnable) {
            await this.orderToppingRepository.update(
                {
                    status: STATUS_ORDERS.CREATED,
                },
                { where: { toppingId, status: STATUS_ACCOUNTS.DISABLED } },
            );
        } else {
            await this.orderToppingRepository.update(
                {
                    status,
                },
                { where: { toppingId, status: STATUS_ORDERS.CREATED } },
            );
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

        await this.orderToppingRepository.destroy({
            where: {
                toppingId,
                status: STATUS_ORDERS.CREATED,
            },
        });
    }
}
