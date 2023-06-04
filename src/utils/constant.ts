export default {
    mail: {
        templates: {
            VERIFY_CODE: "VERIFY_CODE",
        },
        websiteUrl: "localhost:4000",
    },
};

export const STORE_PROCEDURES = {
    GET_PRODUCT_TOPPING: "GetProductWithToppings",
    GET_CATEGORY_INFO: "GetCategoryInfo",
    GET_TOPPING_INFO: "GetToppingsInfo",
};

export const STATUS_ORDERS = {
    CREATED: "CREATED",
    ORDERED: "ORDERED",
    ORDERED_TOPPING_DISABLED: "ORDERED_DISABLED",
    PROCESSED: "PROCESSED",
    IN_TRANSIT: "IN_TRANSIT",
    RECEIVED: "RECEIVED",
};

export const VOUCHER_TYPES = {
    PERCENT_DISCOUNT: "PERCENT_DISCOUNT",
    PRICE_DISCOUNT: "PRICE_DISCOUNT",
};

export const ROLES = {
    USER: "USER",
    SUPER_ADMIN: "SUPER_ADMIN",
};

export const STATUS_ACCOUNTS = {
    ACTIVE: "ACTIVE",
    DISABLED: "DISABLED",
};

export const FORMAT_DATE_TIME = "YYYY-MM-DD HH:mm:ss";
