import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { ICategory } from "./index";
import { uploadImage, delay } from "src/utils/helper";
import { STATUS_ACCOUNTS, STORE_PROCEDURES } from "src/utils/constant";
import { Op } from "sequelize";
import moment from "moment";
import { IProduct } from "../product";

@Injectable()
export class CategoryService {
    constructor(
        @Inject("CATEGORIES_REPOSITORY")
        private categoryRepository: typeof ICategory,
        @Inject("PRODUCTS_REPOSITORY")
        private productRepository: typeof IProduct,
    ) {}

    async findAll({ enable }: { enable: boolean }) {
        const [categories] = await this.categoryRepository.sequelize.query(
            `EXEC ${STORE_PROCEDURES.GET_CATEGORY_INFO}`,
        );
        return !!enable ? categories.filter((category: ICategory) => category.enable) : categories;
    }

    async createCategory({
        description,
        favIcon,
        nameCategory,
    }: {
        favIcon: Express.Multer.File;
        nameCategory: string;
        description: string;
    }) {
        const isExistName = await this.categoryRepository.findOne({
            where: {
                nameCategory,
                deleted: false,
            },
        });
        if (isExistName) {
            throw new BadRequestException("Name category is already existed");
        }
        const pathImg = await uploadImage(favIcon, `${Date.now()}`, "category");
        await this.categoryRepository.create({
            nameCategory,
            description,
            favIcon: pathImg,
        });
    }

    async updateCategory({
        description,
        favIcon,
        nameCategory,
        categoryId,
    }: {
        favIcon: Express.Multer.File;
        nameCategory: string;
        description: string;
        categoryId: number;
    }) {
        const isExistName = await this.categoryRepository.findOne({
            where: {
                nameCategory,
                id: {
                    [Op.ne]: categoryId,
                },
                deleted: false,
            },
        });
        if (isExistName) {
            throw new BadRequestException("Name category is already existed");
        }
        const updateDoc: any = {
            nameCategory,
            description,
        };
        if (favIcon) {
            const pathImg = await uploadImage(favIcon, `${Date.now()}`, "category");
            updateDoc.favIcon = pathImg;
        }
        await this.categoryRepository.update(updateDoc, { where: { id: categoryId } });
    }

    async updateStatus(categoryId: number, status: string) {
        const countUpdate = await this.categoryRepository.update(
            {
                enable: status === STATUS_ACCOUNTS.ACTIVE,
            },
            { where: { id: categoryId } },
        );

        if (!countUpdate) {
            throw new BadRequestException("Category is not existed");
        }
    }

    async deleteCategory(categoryId: number) {
        const updateDoc = {
            deleted: true,
            deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        const countUpdate = await this.categoryRepository.update(updateDoc, {
            where: { id: categoryId },
        });

        await this.productRepository.update(updateDoc, {
            where: { categoryId },
        });

        if (!countUpdate) {
            throw new BadRequestException("Category is not existed");
        }
    }
}
