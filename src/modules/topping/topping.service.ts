import { Injectable, Inject } from "@nestjs/common";
import { ITopping } from "./index";

@Injectable()
export class ToppingService {
    constructor(
        @Inject("TOPPINGS_REPOSITORY")
        private toppingRepository: typeof ITopping,
    ) {}

    async findAll() {
        return this.toppingRepository.findAll();
    }

    async initData() {
        await this.toppingRepository.bulkCreate([
            {
                nameTopping: "Lychee",
                price: 10,
            },
            {
                nameTopping: "Strawberry",
                price: 15,
            },
            {
                nameTopping: "Shot Espresso",
                price: 20,
            },
            {
                nameTopping: "White Pearl",
                price: 5,
            },
        ]);
    }
}
