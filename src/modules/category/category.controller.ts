import {
    Controller,
    Get,
    Res,
    Post,
    Body,
    UploadedFile,
    Put,
    UseInterceptors,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    ParseBoolPipe,
    Delete,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { FileInterceptor } from "@nestjs/platform-express/multer";

@Controller("categories")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}
    @Get("")
    async getCategories(@Res() res, @Query("enable", ParseBoolPipe) enable: boolean) {
        const data = await this.categoryService.findAll({ enable });
        res.status(200).json({
            message: "success",
            data,
        });
    }

    @Post("")
    @UseInterceptors(FileInterceptor("favIcon"))
    async createCategory(@Res() res, @UploadedFile() file: Express.Multer.File, @Body() body) {
        const payload = JSON.parse(JSON.stringify(body));
        await this.categoryService.createCategory({ ...payload, favIcon: file });
        res.status(200).json({
            message: "success",
        });
    }

    @Put("/:categoryId")
    @UseInterceptors(FileInterceptor("favIcon"))
    async updateCategory(
        @Res() res,
        @UploadedFile() file: Express.Multer.File,
        @Body() body,
        @Param("categoryId", ParseIntPipe) categoryId: number,
    ) {
        const payload = JSON.parse(JSON.stringify(body));
        await this.categoryService.updateCategory({ ...payload, favIcon: file, categoryId });
        res.status(200).json({
            message: "success",
        });
    }

    @Patch("/:categoryId/status/:status")
    async updateStatus(
        @Res() res,
        @Param("categoryId", ParseIntPipe) categoryId: number,
        @Param("status") status: string,
    ) {
        await this.categoryService.updateStatus(categoryId, status);
        res.status(200).json({
            message: "success",
        });
    }

    @Delete("/:categoryId")
    async deleteCategory(@Res() res, @Param("categoryId", ParseIntPipe) categoryId: number) {
        await this.categoryService.deleteCategory(categoryId);
        res.status(200).json({
            message: "success",
        });
    }
}
