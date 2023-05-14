import { Controller, Get, Res } from "@nestjs/common";
import { CategoryService } from "./category.service";

@Controller("categories")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}
    @Get("")
    async getCategories(@Res() res) {
        const data = await this.categoryService.findAll();
        res.status(200).json({
            message: "success",
            data,
        });
    }
}
