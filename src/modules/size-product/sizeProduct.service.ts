import { Injectable, Inject } from "@nestjs/common";
import { ISizeProduct } from "./index";

@Injectable()
export class SizeProductService {
    constructor(
        @Inject("SIZE_PRODUCT_REPOSITORY")
        private sizeProductRepository: typeof ISizeProduct,
    ) {}

    async findByProductId(productId: number) {
        return this.sizeProductRepository.findAll({
            where: { productId },
            order: [["price", "DESC"]],
        });
    }
}
