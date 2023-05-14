import { Injectable, Inject } from "@nestjs/common";
import { ICategory } from "./index";

@Injectable()
export class CategoryService {
    constructor(
        @Inject("CATEGORIES_REPOSITORY")
        private categoryRepository: typeof ICategory,
    ) {}

    async findAll() {
        return this.categoryRepository.findAll();
    }
}
