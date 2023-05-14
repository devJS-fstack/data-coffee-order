import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { IOrder, IOrderProductDetail, IOrderToppingDetail } from "./index";
import { ICurrentUser } from "src/middleware/authentication";
import moment from "moment";
import { IProduct } from "../product";
import { Op } from "sequelize";
import { ITopping } from "../topping";
import { STATUS_ORDERS, VOUCHER_TYPES } from "src/utils/constant";
import { IVoucher } from "../voucher";

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
        const {
            nameReceiver,
            phoneReceiver,
            addressReceiver,
            instructionAddressReceiver,
            plannedReceivedDate,
            paymentMethod,
            shippingFee,
            orderDetail,
            voucherId,
        } = payload;
        const isExistOrder = await this.orderRepository.findOne({
            where: { status: STATUS_ORDERS.CREATED, userId: currentUser.id },
        });

        if (!isExistOrder) {
            const order: Partial<IOrder> = {
                nameReceiver,
                phoneReceiver,
                addressReceiver,
                instructionAddressReceiver,
                paymentMethod,
                shippingFee,
                userId: currentUser.id,
                created: moment().format("YYYY-MM-DD HH:mm:ss"),
                status: STATUS_ORDERS.CREATED,
            };
            const orderDoc = await this.orderRepository.create(order);
            let totalPayment = orderDoc.totalPayment || 0;
            const product = await this.productRepository.findByPk(orderDetail.productId);
            if (!product) {
                throw new BadRequestException(`Product ${orderDetail.productId} invalid`);
            }

            for (const orderTopping of orderDetail.toppings) {
                const topping = await this.toppingRepository.findByPk(orderTopping.toppingId);
                if (!topping) {
                    throw new BadRequestException(`Topping ${orderTopping.toppingId} invalid`);
                }

                const totalPrice = topping.price * orderTopping.quantity;
                await this.orderToppingRepository.create({
                    orderId: orderDoc.id,
                    productId: product.id,
                    toppingId: topping.id,
                    quantity: orderTopping.quantity,
                    totalPrice,
                });
                totalPayment += totalPrice;
            }

            const totalPrice = product.price * orderDetail.quantity;
            await this.orderProductRepository.create({
                orderId: orderDoc.id,
                productId: product.id,
                quantity: orderDetail.quantity,
                totalPrice,
                sizeId: orderDetail.sizeId,
            });

            totalPayment += totalPrice;
            const updateDoc = {
                voucherId: null,
                voucherDiscount: 0,
                totalPayment: 0,
            };

            if (voucherId) {
                const voucherDetail = await this.voucherRepository.findByPk(voucherId);
                if (voucherDetail) {
                    updateDoc.voucherDiscount = this.getDiscountByVoucher(
                        totalPayment,
                        voucherDetail,
                    );
                    totalPayment += updateDoc.voucherDiscount;
                    updateDoc.voucherId = voucherId;
                }
            }

            updateDoc.totalPayment = totalPayment;
            await this.orderRepository.update(updateDoc, {
                where: {
                    id: orderDoc.id,
                },
            });
        }
    }

    getDiscountByVoucher(
        totalPayment: number,
        { minPayment, priceDiscount, type, percentDiscount, maxDiscount }: IVoucher,
    ) {
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
}
