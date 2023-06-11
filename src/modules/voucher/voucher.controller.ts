import {
    Body,
    Controller,
    Get,
    Post,
    Res,
    Query,
    UseInterceptors,
    UploadedFile,
    Param,
    ParseIntPipe,
    Put,
    Patch,
    Delete,
    Req,
} from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { IRequest } from "src/middleware/authentication";

@Controller("vouchers")
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) {}
    @Get("")
    async getActiveVouchers(@Res() res, @Req() req: IRequest) {
        const data = await this.voucherService.getActiveVouchers(req.currentUser);
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
    @UseInterceptors(FileInterceptor("image"))
    async createVoucher(@Res() res, @UploadedFile() file: Express.Multer.File, @Body() body) {
        await this.voucherService.createVoucher({ ...body, image: file });
        res.status(200).json({
            message: "success",
        });
    }

    @Put("/:voucherId")
    @UseInterceptors(FileInterceptor("image"))
    async updateVoucher(
        @Res() res,
        @UploadedFile() file: Express.Multer.File,
        @Body() body,
        @Param("voucherId", ParseIntPipe) voucherId: number,
    ) {
        await this.voucherService.updateVoucher({ ...body, image: file }, voucherId);
        res.status(200).json({
            message: "success",
        });
    }

    @Patch("/:voucherId/status/:status")
    async updateStatus(
        @Res() res,
        @Param("voucherId", ParseIntPipe) voucherId: number,
        @Param("status") status: string,
    ) {
        await this.voucherService.updateStatus(voucherId, status);
        res.status(200).json({
            message: "success",
        });
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

    @Delete("/:voucherId")
    async deleteCategory(@Res() res, @Param("voucherId", ParseIntPipe) voucherId: number) {
        await this.voucherService.deleteOne(voucherId);
        res.status(200).json({
            message: "success",
        });
    }
}
