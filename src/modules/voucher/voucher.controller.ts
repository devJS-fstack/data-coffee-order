import { Body, Controller, Get, Post, Res, UsePipes, Query } from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { BaseValidationPipe } from "src/validation/base";
import { createVoucherSchema } from "src/validation/voucher";
import { IVoucher } from ".";

@Controller("vouchers")
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) {}
    @Get("")
    async getActiveVouchers(@Res() res) {
        const data = await this.voucherService.getActiveVouchers();
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Get("/all")
    async getAllVoucher(@Res() res) {
        const data = await this.voucherService.getAllVoucher();
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Post("")
    @UsePipes(new BaseValidationPipe(createVoucherSchema))
    async createVoucher(@Body() voucher: IVoucher) {
        await this.voucherService.createVoucher(voucher);
    }

    @Get("/discount")
    async getDiscountVoucher(@Res() res, @Query() query: { totalPayment: number; code: string }) {
        const data = await this.voucherService.getDiscountByVoucher({
            totalPayment: query.totalPayment,
            code: query.code,
        });
        res.status(200).json({
            message: "success",
            data,
        });
    }
}
