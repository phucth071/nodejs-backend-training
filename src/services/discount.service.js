'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { discount } = require('../models/discount.model')
const { convertToObjectIdMongodb } = require('../utils/index')
const  ProductRepository = require('../models/repositories/product.repository')
const  DiscountRepository = require('../models/repositories/discount.repository')
const mongoose = require('mongoose');
const { Types } = mongoose;

class DiscountService {
    
    static async createDiscountCode( payload ) {
        const { name, description, code, type
            , value, start, end, status, limit, used, usedBy
            , maxUsePerUser, minOrderValue, shopId, applyTo, productIds 
         } = payload

        if (new Date() < new Date(start) || new Date() > new Date(end) || new Date(start) > new Date(end)) {
            throw new BadRequestError('Invalid date range')
        }

        if (minOrderValue < 0) {
            throw new BadRequestError('Invalid min order value')
        }

        if (maxUsePerUser < 0) {
            throw new BadRequestError('Invalid max use per user')
        }

        if (limit < 0) {
            throw new BadRequestError('Invalid limit')
        }

        if (type !== 'fixed_amount' && type !== 'percentage') {
            throw new BadRequestError('Invalid discount type')
        }

        if (applyTo !== 'all' && applyTo !== 'specific_products' && applyTo !== 'specific_categories') {
            throw new BadRequestError('Invalid apply to')
        }

        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        });

        if (foundDiscount && foundDiscount.discount_status) {
            throw new BadRequestError('Discount code already exist')
        }

        return await discount.create({
            discount_name: name,
            discount_description: description,
            discount_code: code,
            discount_type: type,
            discount_value: value,
            discount_start: new Date(start),
            discount_end: new Date(end),
            discount_status: status,
            discount_limit: limit,
            discount_used: used,
            discount_used_by: usedBy,
            discount_max_use_per_user: maxUsePerUser,
            discount_min_order_value: minOrderValue,
            discount_shopId: convertToObjectIdMongodb(shopId),
            discount_apply_to: applyTo,
            discount_product_ids: applyTo === 'all' ? [] : productIds
        })
    }
 
    static async getAllProductsByDiscountCode(
        code, shopId, limit = 50, page
    ) {
        const foundDiscount = await DiscountRepository.findDiscountByCode(code, shopId)

        if (!foundDiscount || !foundDiscount.discount_status) {
            throw new NotFoundError('Discount code not found')
        }

        if (new Date() < foundDiscount.discount_start || new Date() > foundDiscount.discount_end) {
            throw new BadRequestError('Discount code not available')
        }

        const { discount_apply_to, discount_product_ids } = foundDiscount
        let products
        if (discount_apply_to === 'all') {
            products = await ProductRepository.findAllProducts({
                filter: {
                    product_shop: shopId,
                    isPublished: true,
                },
                limit: +limit,
                page: page,
                sort: 'ctime',
                select: ['product_name']
            })
            return products
        }

        if (discount_apply_to === 'specific_products') {
            console.log(discount_product_ids)
            let ids = discount_product_ids.map(id => new Types.ObjectId(id))
            products = await ProductRepository.findAllProducts({
                filter: {
                    "_id": { "$in": ids },
                    "isPublished": true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
            return products
        }
    }

    static async getAllDiscountCodesByShop(shopId, limit, page) {
        const discounts = await DiscountRepository.findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: shopId,
                discount_status: true
                },
            unSelect: ['discount_used', 'discount_used_by', '__v']
            }
        )
        return discounts
    }

    static async getDiscountAmount (
        code, shopId, userId, products
    ) {
        if (typeof code !== 'string') {
            code = String(code);
        }
        const foundDiscount = await DiscountRepository.findDiscountByCode(code, shopId)
        if (!foundDiscount || !foundDiscount.discount_status) {
            throw new NotFoundError('Discount code not found or expires')
        }

        if (new Date() < foundDiscount.discount_start || new Date() > foundDiscount.discount_end) {
            throw new BadRequestError('Discount code not available')
        }

        if (foundDiscount.discount_used_by.includes(userId)) {
            throw new BadRequestError('Discount code already used')
        }

        if (foundDiscount.discount_used >= foundDiscount.discount_limit) {
            throw new BadRequestError('Discount code limit reached')
        }

        let totalOrderValue = 0;
        if (foundDiscount.discount_min_order_value > 0) {
            for (const product of products) {
                const foundProduct = await ProductRepository.findProduct({
                    product_id: product.product_id,
                    unSelect: ['isDraft', 'isPublished', '__v', 'product_shop']
                })

                totalOrderValue += foundProduct.product_price * product.product_quantity;
            }

            if (totalOrderValue < foundDiscount.discount_min_order_value) {
                throw new BadRequestError('Order value below minimum value');
            }
        }

        if (foundDiscount.discount_apply_to === 'specific_products') {
            const productIds = foundDiscount.discount_product_ids;
            const productIdsSet = new Set(productIds);
            const productIdsInCart = products.map(product => product.product_id);
            const isAllProductsInCart = productIdsInCart.every(productId => productIdsSet.has(productId));
            if (!isAllProductsInCart) {
                throw new BadRequestError('Not all products in cart are eligible for this discount');
            }
        }

        if (foundDiscount.discount_max_use_per_user > 0) {
            const userUsedDiscount = await discount.countDocuments({
                discount_code: code,
                discount_used_by: userId
            })
            // const userUsedDiscount = userUsedDiscount.find(user => user.userId === userId)
            if (userUsedDiscount && userUsedDiscount >= foundDiscount.discount_max_use_per_user) {
                throw new BadRequestError('User limit reached')
            }
        }

        const amount = foundDiscount.discount_type === 'fixed_amount' ? foundDiscount.discount_value : (totalOrderValue * foundDiscount.discount_value) / 100
        
        return {
            totalOrderValue: totalOrderValue,
            discount: amount,
            totalPrice: totalOrderValue - amount
        }
    }

    // Kiểm tra discount có được dùng ở đâu, đang public, có active không???
    // Khi xóa thì lưu lại ở một db khác
    static async deleteDiscountCode( code, shopId ) {
        const deleted = await discount.findOneAndDelete({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }

    static async disableDiscountCode( code, shopId, userId ) {
        const foundDiscount = DiscountRepository.findDiscountByCode(code, shopId)

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found')
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_used_by: userId

            },
            $inc: {
                discount_limit: 1,
                discount_used: -1
            }
        })

        return result
    }
}

module.exports = DiscountService