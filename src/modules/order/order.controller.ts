import {
    Controller,
    Post,
    Res,
    Req,
    Body,
    Get,
    Put,
    Delete,
    Param,
    ParseIntPipe,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { IRequest } from "src/middleware/authentication";

@Controller("orders")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}
    @Post("")
    async createOrder(@Res() res, @Req() req: IRequest, @Body() body) {
        const data = await this.orderService.createOrder({
            currentUser: req.currentUser,
            payload: body,
        });
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Post("/place/:orderId")
    async placeOrder(@Res() res, @Body() body, @Param("orderId", ParseIntPipe) orderId: number) {
        await this.orderService.placeOrder(orderId, body);
        res.status(200).json({
            message: "success",
        });
    }

    @Put("")
    async updateOrder(@Res() res, @Req() req: IRequest, @Body() body) {
        const data = await this.orderService.updateProductOrder(body);
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Put("/mark-status/:orderId")
    async markStatus(@Res() res, @Body() body, @Param("orderId", ParseIntPipe) orderId: number) {
        await this.orderService.markStatus({ orderId });
        res.status(200).json({
            message: "success",
        });
    }

    @Get("/new")
    async getNewOrder(@Res() res, @Req() req: IRequest) {
        const data = await this.orderService.getNewOrder(req.currentUser);
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Get("/placed-order")
    async getNumberOrderPlaced(@Res() res) {
        const data = await this.orderService.getNumberOrderPlaced();
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Get("/")
    async getOrdersByUserId(@Res() res, @Req() req: IRequest) {
        const data = await this.orderService.getOrdersByUserId(req.currentUser.id);
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Get("/all")
    async getOrders(@Res() res, @Req() req: IRequest) {
        const data = await this.orderService.getOrders(req.currentUser.id);
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Delete("/product-orders/:productOrderId")
    async deleteProductOrder(
        @Param("productOrderId", ParseIntPipe) productOrderId: number,
        @Res() res,
    ) {
        await this.orderService.deleteOrderProduct(productOrderId);
        res.status(200).json({
            message: "success",
        });
    }

    @Delete("/:orderId")
    async deleteNewOrder(@Param("orderId", ParseIntPipe) orderId: number, @Res() res) {
        await this.orderService.deleteNewOrder(orderId);
        res.status(200).json({
            message: "success",
        });
    }
}
