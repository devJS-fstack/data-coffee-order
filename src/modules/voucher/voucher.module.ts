import { Module } from "@nestjs/common";
import { VoucherController } from "./voucher.controller";
import { VoucherService } from "./voucher.service";
import { voucherProviders } from "./voucher.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [VoucherController],
    providers: [VoucherService, ...voucherProviders],
})
export class VoucherModule {}
