import { Controller, Post, Res, Req, Body } from "@nestjs/common";
import { OrderService } from "./order.service";
import { IRequest } from "src/middleware/authentication";

@Controller("orders")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}
    @Post("")
    async getOrders(@Res() res, @Req() req: IRequest, @Body() body) {
        const data = await this.orderService.createOrder({
            currentUser: req.currentUser,
            payload: body,
        });
        res.status(200).json({
            message: "success",
            data,
        });
    }
}
