import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { IOrder, IOrderProductDetail, IOrderToppingDetail } from "./index";
import { ICurrentUser } from "src/middleware/authentication";
import moment from "moment";
import { IUser } from "../user";
import { UserService } from "../user/user.service";
import { IProduct } from "../product";
import { Op, or } from "sequelize";
import { ITopping } from "../topping";
import { STATUS_ORDERS, VOUCHER_TYPES, STATUS_ACCOUNTS, ROLES } from "src/utils/constant";
import { IVoucher } from "../voucher";
import { ISizeProduct } from "../size-product";
import { toNumber, sumBy } from "lodash";
import { delay } from "src/utils/helper";
import { Topping } from "../topping/topping.entity";
import axios from "axios";

interface IToppingDetail {
    toppingId: number;
    quantity: number;
}

interface IOrderDetail {
    productId: number;
    quantity: number;
    sizeId: number;
    toppings: IToppingDetail[];
}

export interface IPayloadCreateOrder {
    nameReceiver: string;
    phoneReceiver: string;
    addressReceiver: string;
    instructionAddressReceiver: string;
    plannedReceivedDate?: string;
    paymentMethod: string;
    shippingFee: number;
    voucherId?: number;
    code: string;
    orderDetail: IOrderDetail;
}

@Injectable()
export class OrderService {
    constructor(
        @Inject("ORDERS_REPOSITORY")
        private orderRepository: typeof IOrder,
        @Inject("PRODUCTS_REPOSITORY")
        private productRepository: typeof IProduct,
        @Inject("TOPPINGS_REPOSITORY")
        private toppingRepository: typeof ITopping,
        @Inject("ORDER_PRODUCTS_REPOSITORY")
        private orderProductRepository: typeof IOrderProductDetail,
        @Inject("ORDER_TOPPINGS_REPOSITORY")
        private orderToppingRepository: typeof IOrderToppingDetail,
        @Inject("VOUCHERS_REPOSITORY")
        private voucherRepository: typeof IVoucher,
        @Inject("SIZE_PRODUCT_REPOSITORY")
        private sizeProductRepository: typeof ISizeProduct,
        private userService: UserService,
    ) {}

    async findAll() {
        return this.orderRepository.findAll();
    }

    async createOrder({
        currentUser,
        payload,
    }: {
        currentUser: ICurrentUser;
        payload: IPayloadCreateOrder;
    }) {
        const { nameReceiver, phoneReceiver, orderDetail } = payload;
        let orderDoc = await this.orderRepository.findOne({
            where: { status: STATUS_ORDERS.CREATED, userId: currentUser.id },
        });
        const order: Partial<IOrder> = {
            nameReceiver,
            phoneReceiver,
            shippingFee: 10,
            userId: currentUser.id,
            created: moment().format("YYYY-MM-DD HH:mm:ss"),
            status: STATUS_ORDERS.CREATED,
        };
        const product = await this.productRepository.findByPk(orderDetail.productId);
        const sizeDetail = await this.sizeProductRepository.findByPk(orderDetail.sizeId);
        if (!product) {
            throw new BadRequestException(`Product ${orderDetail.productId} invalid`);
        }

        if (!sizeDetail) {
            throw new BadRequestException(`Size ${orderDetail.sizeId} invalid`);
        }

        if (!orderDoc) {
            orderDoc = await this.orderRepository.create(order);
        }

        const totalPriceProduct =
            product.price * orderDetail.quantity + sizeDetail.price * orderDetail.quantity;
        const orderToppingDoc = await this.orderProductRepository.create({
            orderId: orderDoc.id,
            productId: product.id,
            quantity: orderDetail.quantity,
            totalPrice: totalPriceProduct,
            sizeId: orderDetail.sizeId,
            status: STATUS_ORDERS.CREATED,
        });

        for (const orderTopping of orderDetail.toppings) {
            const topping = await this.toppingRepository.findByPk(orderTopping.toppingId);
            if (!topping) {
                throw new BadRequestException(`Topping ${orderTopping.toppingId} invalid`);
            }

            const totalPriceTopping = topping.price * orderTopping.quantity * orderDetail.quantity;
            await this.orderToppingRepository.create({
                orderId: orderDoc.id,
                toppingId: topping.id,
                quantity: orderTopping.quantity,
                totalPrice: totalPriceTopping,
                productOrderId: orderToppingDoc.id,
                productQuantity: orderDetail.quantity,
                status: STATUS_ORDERS.CREATED,
            });
        }

        await this.orderRepository.update(
            {
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            {
                where: {
                    id: orderDoc.id,
                },
            },
        );
    }

    async updateProductOrder({
        productOrderId,
        quantity,
        toppingOrders,
        sizeId,
    }: {
        productOrderId: number;
        quantity: number;
        sizeId: number;
        toppingOrders: IToppingDetail[];
    }) {
        const productOrder = await this.orderProductRepository.findByPk(productOrderId);
        if (!productOrder) {
            throw new BadRequestException(`Product ${productOrderId} is invalid`);
        }

        const productDetail = await this.productRepository.findByPk(productOrder.productId);
        const sizeDetail = await this.sizeProductRepository.findByPk(sizeId);
        const totalPriceProduct = (productDetail.price + sizeDetail.price) * quantity;
        await this.orderProductRepository.update(
            {
                totalPrice: totalPriceProduct,
                quantity: quantity,
                sizeId,
            },
            { where: { id: productOrder.id } },
        );

        const orderToppingExists = await this.orderToppingRepository.findAll({
            where: {
                productOrderId: productOrder.id,
            },
        });

        for (const toppingOrder of toppingOrders) {
            const toppingDetail = await this.toppingRepository.findByPk(toppingOrder.toppingId);
            const isExistOrderTopping = orderToppingExists.find(
                (element) => element.toppingId === toppingOrder.toppingId,
            );
            const totalPriceTopping = toppingDetail.price * toppingOrder.quantity * quantity;
            if (isExistOrderTopping) {
                // update
                await this.orderToppingRepository.update(
                    {
                        totalPrice: totalPriceTopping,
                        quantity: toppingOrder.quantity,
                        productQuantity: quantity,
                        updated: moment().format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { id: isExistOrderTopping.id } },
                );
            } else {
                // create new
                await this.orderToppingRepository.create({
                    orderId: productOrder.orderId,
                    toppingId: toppingDetail.id,
                    quantity: toppingOrder.quantity,
                    productQuantity: quantity,
                    productOrderId: productOrder.id,
                    totalPrice: totalPriceTopping,
                    status: STATUS_ORDERS.CREATED,
                });
            }
        }

        const listIdOrderToppingRemove = orderToppingExists
            .filter(
                (element) =>
                    !toppingOrders.find(
                        (toppingOrder) => toppingOrder.toppingId === element.toppingId,
                    ),
            )
            .map((ele) => ele.id);

        if (listIdOrderToppingRemove.length) {
            await this.orderToppingRepository.destroy({
                where: {
                    id: listIdOrderToppingRemove,
                },
            });
        }

        await this.orderRepository.update(
            {
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { where: { id: productOrder.orderId } },
        );
    }

    async getNewOrder(currentUser: ICurrentUser) {
        await delay(1000);
        const newOrder = await this.orderRepository.findOne({
            where: { status: STATUS_ORDERS.CREATED, userId: currentUser.id },
        });

        if (newOrder) {
            const productOrders = await this.orderProductRepository.findAll({
                where: { orderId: newOrder.id },
            });
            return {
                order: newOrder,
                productOrders: await Promise.all(
                    productOrders.map(async (productOrder) => {
                        const productDetail = await this.productRepository.findByPk(
                            productOrder.productId,
                        );
                        const sizeDetail = await this.sizeProductRepository.findByPk(
                            productOrder.sizeId,
                        );
                        const toppings = await this.orderToppingRepository.findAll({
                            where: {
                                productOrderId: productOrder.id,
                                status: STATUS_ORDERS.CREATED,
                            },
                        });
                        return {
                            ...productOrder.dataValues,
                            nameProduct: productDetail.nameProduct,
                            size: sizeDetail?.size,
                            toppings: toppings || [],
                        };
                    }),
                ),
            };
        }

        return newOrder;
    }

    async deleteOrderProduct(productOrderId: number) {
        const productOrderDetail = await this.orderProductRepository.findByPk(productOrderId);
        if (!productOrderDetail) {
            throw new BadRequestException("Product order not existed");
        }

        await this.orderToppingRepository.destroy({
            where: {
                productOrderId,
            },
        });
        await this.orderProductRepository.destroy({
            where: {
                id: productOrderId,
            },
        });
        const existProductOrder = await this.orderProductRepository.findOne({
            where: {
                orderId: productOrderDetail.orderId,
            },
        });
        if (!existProductOrder) {
            await this.orderRepository.destroy({
                where: {
                    id: productOrderDetail.orderId,
                },
            });
            return;
        }
        await this.orderRepository.update(
            {
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            {
                where: {
                    id: productOrderDetail.orderId,
                },
            },
        );
    }

    async deleteNewOrder(orderId: number) {
        const productOrders = await this.orderProductRepository.findAll({
            where: {
                orderId,
            },
        });

        if (!productOrders.length) {
            throw new BadRequestException("Order id not invalid");
        }

        await Promise.all(
            productOrders.map(async (productOrder) => {
                await this.orderToppingRepository.destroy({
                    where: {
                        productOrderId: productOrder.id,
                    },
                });
            }),
        );
        await this.orderProductRepository.destroy({
            where: {
                orderId,
            },
        });
        await this.orderRepository.destroy({
            where: {
                id: orderId,
            },
        });
    }

    async getDiscountByVoucher({ code, totalPayment }: { totalPayment: number; code: string }) {
        const voucherDetail = await this.voucherRepository.findOne({
            where: {
                code,
                enable: true,
                deleted: false,
            },
        });
        const result = {
            voucherId: null,
            voucherDiscount: 0,
        };
        if (!voucherDetail) {
            return result;
        }
        result.voucherId = voucherDetail.id;
        const { minPayment, priceDiscount, type, percentDiscount, maxDiscount } = voucherDetail;
        if (totalPayment >= minPayment) {
            switch (type) {
                case VOUCHER_TYPES.PRICE_DISCOUNT:
                    result.voucherDiscount = priceDiscount;
                    break;
                case VOUCHER_TYPES.PERCENT_DISCOUNT:
                    const discount = (totalPayment * percentDiscount) / 100;
                    if (discount > maxDiscount) {
                        result.voucherDiscount = maxDiscount;
                        break;
                    }
                    result.voucherDiscount = discount;
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    async placeOrder(orderId: number, payload: IPayloadCreateOrder) {
        const {
            addressReceiver,
            plannedReceivedDate,
            nameReceiver,
            phoneReceiver,
            instructionAddressReceiver,
            paymentMethod,
            code,
        } = payload;
        const orderDetail = await this.orderRepository.findByPk(orderId);
        if (!orderDetail) {
            throw new BadRequestException("Order is not valid");
        }

        const { voucherDiscount, voucherId } = await this.getDiscountByVoucher({
            code,
            totalPayment: orderDetail.totalPayment,
        });

        await this.orderRepository.update(
            {
                addressReceiver,
                plannedReceivedDate,
                nameReceiver,
                phoneReceiver,
                instructionAddressReceiver,
                paymentMethod,
                voucherId,
                voucherDiscount,
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
                orderedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                status: STATUS_ORDERS.ORDERED,
            },
            {
                where: {
                    id: orderId,
                },
            },
        );

        await this.orderProductRepository.update(
            {
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
                status: STATUS_ORDERS.ORDERED,
            },
            { where: { orderId } },
        );

        await this.orderToppingRepository.update(
            {
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
                status: STATUS_ORDERS.ORDERED,
            },
            { where: { orderId } },
        );

        await this.orderToppingRepository.update(
            {
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
                status: STATUS_ORDERS.ORDERED_TOPPING_DISABLED,
            },
            { where: { orderId, status: STATUS_ACCOUNTS.DISABLED } },
        );

        await axios("http://localhost:8080/api/message", {
            method: "POST",
            data: {
                message: "Hello",
            },
        });
    }

    async getOrdersByUserId(userId: number) {
        const orders = await this.orderRepository.findAll({
            where: {
                userId,
                status: {
                    [Op.ne]: STATUS_ORDERS.CREATED,
                },
            },
            order: [["orderedDate", "DESC"]],
        });

        return Promise.all(
            orders.map(async (order) => {
                const productOrders = await this.orderProductRepository.findAll({
                    where: { orderId: order.id },
                });

                return {
                    ...order.dataValues,
                    productOrders: await Promise.all(
                        productOrders.map(async (productOrder) => {
                            const productDetail = await this.productRepository.findByPk(
                                productOrder.productId,
                            );
                            const sizeDetail = await this.sizeProductRepository.findByPk(
                                productOrder.sizeId,
                            );
                            const toppings = await this.orderToppingRepository.findAll({
                                where: { productOrderId: productOrder.id },
                                include: [
                                    {
                                        model: Topping,
                                    },
                                ],
                            });
                            return {
                                ...productOrder.dataValues,
                                nameProduct: productDetail.nameProduct,
                                size: sizeDetail?.size,
                                toppings: toppings || [],
                            };
                        }),
                    ),
                };
            }),
        );
    }

    async getOrders(userId: number) {
        await this.userService.authentication({ userId, role: ROLES.SUPER_ADMIN });
        const orders = await this.orderRepository.findAll({});

        return Promise.all(
            orders.map(async (order) => {
                const productOrders = await this.orderProductRepository.findAll({
                    where: { orderId: order.id },
                });

                return {
                    ...order.dataValues,
                    productOrders: await Promise.all(
                        productOrders.map(async (productOrder) => {
                            const productDetail = await this.productRepository.findByPk(
                                productOrder.productId,
                            );
                            const sizeDetail = await this.sizeProductRepository.findByPk(
                                productOrder.sizeId,
                            );
                            const toppings = await this.orderToppingRepository.findAll({
                                where: { productOrderId: productOrder.id },
                                include: [
                                    {
                                        model: Topping,
                                    },
                                ],
                            });
                            return {
                                ...productOrder.dataValues,
                                nameProduct: productDetail.nameProduct,
                                size: sizeDetail?.size,
                                sizeDetail: sizeDetail?.dataValues,
                                toppings: toppings || [],
                            };
                        }),
                    ),
                };
            }),
        );
    }

    async markStatus({ orderId }: { orderId: number }) {
        const orderDetail = await this.orderRepository.findByPk(orderId);
        if (!orderDetail) {
            throw new BadRequestException("Order is not valid");
        }

        const stepStatus = {
            ORDERED: {
                status: STATUS_ORDERS.PROCESSED,
                key: "processedDate",
            },
            PROCESSED: {
                status: STATUS_ORDERS.IN_TRANSIT,
                key: "shipDate",
            },
            IN_TRANSIT: {
                status: STATUS_ORDERS.RECEIVED,
                key: "receivedDate",
            },
        };

        const newStatus = stepStatus[orderDetail.status];

        if (!newStatus) {
            throw new BadRequestException("Something went wrong !");
        }

        await this.orderRepository.update(
            {
                status: newStatus.status,
                [`${newStatus.key}`]: moment().format("YYYY-MM-DD HH:mm:ss"),
                updated: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { where: { id: orderId } },
        );
    }

    async getNumberOrderPlaced() {
        return this.orderRepository.count({ where: { status: STATUS_ORDERS.ORDERED } });
    }
}
