import { Injectable, Inject } from "@nestjs/common";
import { IProductTopping } from "./index";
import { Optional } from "sequelize";

@Injectable()
export class ProductToppingService {
    constructor(
        @Inject("PRODUCT_TOPPING_REPOSITORY")
        private toppingRepository: typeof IProductTopping,
    ) {}

    async findAll() {
        return this.toppingRepository.findAll();
    }

    async initData() {
        const productToppings: Optional<any, string>[] = [
            {
                product_id: 1,
                topping_id: 1,
            },
            {
                product_id: 1,
                topping_id: 2,
            },
            {
                product_id: 1,
                topping_id: 3,
            },
            {
                product_id: 1,
                topping_id: 4,
            },
        ];
        await this.toppingRepository.bulkCreate(productToppings);
    }
}
