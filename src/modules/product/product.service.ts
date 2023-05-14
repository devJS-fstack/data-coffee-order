import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { IProduct } from "./index";
import { delay } from "src/utils/helper";
import { STORE_PROCEDURES } from "src/utils/constant";
import { isEmpty } from "lodash";
import { SizeProductService } from "../size-product/sizeProduct.service";

@Injectable()
export class ProductService {
    constructor(
        @Inject("PRODUCTS_REPOSITORY")
        private productRepository: typeof IProduct,
        private readonly sizeProductService: SizeProductService,
    ) {}

    async getProducts({
        categoryId,
        limit,
        offset,
    }: {
        categoryId: number;
        offset: number;
        limit: number;
    }) {
        await delay(1000);
        if (!categoryId) {
            return {
                data: [],
                total: 0,
            };
        }

        const total = await this.productRepository.count({ where: { categoryId } });
        const data = await this.productRepository.findAll({ where: { categoryId }, limit, offset });

        return {
            total,
            data,
        };
    }

    async getProductById(productId: number) {
        await delay(1000);
        const [product]: any = await this.productRepository.sequelize.query(
            `EXEC ${STORE_PROCEDURES.GET_PRODUCT_TOPPING} @id = :id;`,
            {
                replacements: {
                    id: productId,
                },
            },
        );

        let productMapped = {};
        if (!product?.length) {
            productMapped = await this.productRepository.findByPk(productId);
        } else {
            productMapped = {
                id: productId,
                nameProduct: product[0].name_product,
                favIcon: product[0].fav_icon,
                description: product[0].description,
                price: product[0].price,
            };
        }

        if (isEmpty(productMapped)) {
            throw new BadRequestException();
        }

        const sizeProducts = await this.sizeProductService.findByProductId(productId);

        return {
            product: productMapped,
            toppings: product.map((element) => ({
                id: element.topping_id,
                price: element.price_topping,
                nameTopping: element.name_topping,
            })),
            sizes: sizeProducts.map((sizeProduct) => ({
                id: sizeProduct.id,
                price: sizeProduct.price,
                size: sizeProduct.size,
            })),
        };
    }
}
