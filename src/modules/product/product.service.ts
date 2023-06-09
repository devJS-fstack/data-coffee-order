import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { IProduct } from "./index";
import { delay, uploadImage } from "src/utils/helper";
import { STORE_PROCEDURES, STATUS_ACCOUNTS, STATUS_ORDERS } from "src/utils/constant";
import { isEmpty } from "lodash";
import { SizeProductService } from "../size-product/sizeProduct.service";
import { ICategory } from "../category";
import { ISizeProduct } from "../size-product";
import { IOrderProductDetail } from "../order";
import { Op } from "sequelize";
import moment from "moment";
import { IProductTopping } from "../product-topping";

@Injectable()
export class ProductService {
    constructor(
        @Inject("PRODUCTS_REPOSITORY")
        private productRepository: typeof IProduct,
        @Inject("CATEGORIES_REPOSITORY")
        private categoryRepository: typeof ICategory,
        @Inject("SIZES_REPOSITORY")
        private sizeProductRepository: typeof ISizeProduct,
        @Inject("PRODUCT_TOPPING_REPOSITORY")
        private productToppingRepository: typeof IProductTopping,
        @Inject("ORDER_PRODUCTS_REPOSITORY")
        private orderProductRepository: typeof IOrderProductDetail,
        private readonly sizeProductService: SizeProductService,
    ) {}

    async getProducts({
        categoryId,
        limit,
        offset,
        enable,
    }: {
        categoryId: number;
        offset: number;
        limit: number;
        enable: boolean;
    }) {
        await delay(500);
        if (!categoryId) {
            return {
                data: await this.productRepository.findAll({
                    where: { deleted: false, enable: true },
                }),
            };
        }
        const query: any = {
            categoryId,
            deleted: false,
        };
        if (enable) {
            query.enable = enable;
        }

        const total = await this.productRepository.count({ where: query });
        const data = await this.productRepository.findAll({
            where: query,
            limit,
            offset,
        });

        return {
            total,
            data: await Promise.all(
                data.map(async (product) => {
                    const sizeProducts = await this.sizeProductRepository.findAll({
                        where: { productId: product.id },
                    });
                    const toppings = await this.productToppingRepository.findAll({
                        where: { productId: product.id },
                    });
                    return {
                        ...product.dataValues,
                        sizes: sizeProducts,
                        toppingIds: toppings.map((topping) => topping.toppingId),
                    };
                }),
            ),
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
                deleted: element.deleted,
                enable: element.enable,
            })),
            sizes: sizeProducts.map((sizeProduct) => ({
                id: sizeProduct.id,
                price: sizeProduct.price,
                size: sizeProduct.size,
            })),
        };
    }

    async createProduct({
        description,
        favIcon,
        nameProduct,
        categoryId,
        price,
        sizes,
        toppingIds,
    }: {
        favIcon: Express.Multer.File;
        nameProduct: string;
        description: string;
        categoryId: number;
        price: number;
        sizes: {
            name: string;
            price: number;
        }[];
        toppingIds: number[];
    }) {
        const existName = await this.productRepository.findOne({
            where: {
                nameProduct,
                deleted: false,
            },
        });
        if (existName) {
            throw new BadRequestException("Name product is already existed");
        }

        const existCategory = await this.categoryRepository.findByPk(categoryId);
        if (!existCategory) {
            throw new BadRequestException("Category is not supported");
        }

        const pathImg = await uploadImage(favIcon, `${Date.now()}`, "product");
        const productDoc = await this.productRepository.create({
            nameProduct,
            description,
            favIcon: pathImg,
            price,
            categoryId,
        });

        if (sizes?.length) {
            await this.sizeProductRepository.bulkCreate(
                sizes.map((size) => ({
                    size: size.name,
                    price: size.price,
                    productId: productDoc.id,
                })),
            );
        } else {
            await this.sizeProductRepository.create({
                size: "Default",
                price: 0,
                productId: productDoc.id,
            });
        }

        if (toppingIds.length) {
            await this.productToppingRepository.bulkCreate(
                toppingIds.map((toppingId) => ({
                    toppingId,
                    productId: productDoc.id,
                })),
            );
        }
    }

    async updateProduct({
        description,
        favIcon,
        nameProduct,
        categoryId,
        productId,
        price,
        sizes,
        toppingIds,
    }: {
        productId: number;
        favIcon: Express.Multer.File;
        nameProduct: string;
        description: string;
        categoryId: number;
        price: number;
        sizes: {
            name: string;
            price: number;
        }[];
        toppingIds: number[];
    }) {
        const isExistName = await this.productRepository.findOne({
            where: {
                nameProduct,
                id: {
                    [Op.ne]: productId,
                },
                deleted: false,
            },
        });
        if (isExistName) {
            throw new BadRequestException("Name product is already existed");
        }

        const existCategory = await this.categoryRepository.findByPk(categoryId);
        if (!existCategory) {
            throw new BadRequestException("Product is not supported");
        }

        const updateDoc: any = {
            nameProduct,
            description,
            categoryId,
            price,
        };
        if (favIcon) {
            const pathImg = await uploadImage(favIcon, `${Date.now()}`, "product");
            updateDoc.favIcon = pathImg;
        }
        await this.productRepository.update(updateDoc, { where: { id: productId } });
        await this.sizeProductRepository.destroy({
            where: {
                productId,
            },
        });
        await this.productToppingRepository.destroy({
            where: {
                productId,
            },
        });

        if (sizes?.length) {
            await this.sizeProductRepository.bulkCreate(
                sizes.map((size) => ({
                    size: size.name,
                    price: size.price,
                    productId,
                })),
            );
        } else {
            await this.sizeProductRepository.create({
                size: "Default",
                price: 0,
                productId,
            });
        }

        if (toppingIds.length) {
            await this.productToppingRepository.bulkCreate(
                toppingIds.map((toppingId) => ({
                    toppingId,
                    productId,
                })),
            );
        }

        const sizeDefault = await this.sizeProductRepository.findOne({
            where: { productId, price: 0 },
        });

        await this.orderProductRepository.sequelize.query(
            "UPDATE OrderProductDetails SET total_price = :price * quantity, size_id = :sizeId WHERE product_id = :productId AND status = :status",
            {
                replacements: {
                    price,
                    sizeId: sizeDefault.id,
                    productId,
                    status: STATUS_ORDERS.CREATED,
                },
            },
        );
    }

    async deleteProduct(productId: number) {
        const [countUpdate] = await this.productRepository.update(
            {
                deleted: true,
                deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            { where: { id: productId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Product is not existed");
        }
    }

    async updateStatus(productId: number, status: string) {
        const [countUpdate] = await this.productRepository.update(
            {
                enable: status === STATUS_ACCOUNTS.ACTIVE,
            },
            { where: { id: productId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Product is not existed");
        }
    }
}
