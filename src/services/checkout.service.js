'use strict'

const  CartRepository  = require('../models/repositories/cart.repository')
const { BadRequestError, ForbiddenError, NotFoundError } = require('../core/error.response')
const  ProductRepository = require('../models/repositories/product.repository')
const  DiscountService = require('./discount.service')

class CheckoutService {

    /*
    payload = {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [
                    shopId,
                    code
                ],
                item_products: [
                    {
                        product_id,
                        quantity,
                        price
                    }
                ]
            }, ...
        ]
    }
    */
    static async checkoutReview(
        cartId, userId, shop_order_ids
    ) {
        const cart = await CartRepository.findCartByUserId({ userId })
        if (!cart) throw new BadRequestError('Cart not found')
    
        const checkout_info = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = []


        if (shop_order_ids && shop_order_ids.length) {
            for (let i = 0; i < shop_order_ids.length; i++) {
                const { shopId, shop_discounts, item_products } = shop_order_ids[i]
                const checkProductAvailable = await ProductRepository.checkProductAvailable(item_products)
                if (!checkProductAvailable || checkProductAvailable.length === 0) throw new BadRequestError('Product not available')
                    
                const checkoutPrice = checkProductAvailable.reduce((acc, product) => {
                    return acc + (product.product_quantity * product.product_price)
                }, 0)

                checkout_info.totalPrice += checkoutPrice

                const itemCheckout = {
                    shopId,
                    shop_discounts,
                    item_products: checkProductAvailable,
                    rawPrice: checkoutPrice,
                    discountApplyPrice: checkoutPrice,
                }

                if (shop_discounts.length > 0) {
                    const discountResult = await DiscountService.getDiscountAmount(
                        shop_discounts[0].code,
                        shop_discounts[0].shopId,
                        userId,
                        checkProductAvailable
                    )
                    checkout_info.totalDiscount += discountResult.discount
                    if (discountResult.discount > 0) {
                        itemCheckout.discountApplyPrice = discountResult.totalPrice
                    }
                }

                checkout_info.totalCheckout += itemCheckout.discountApplyPrice
                shop_order_ids_new.push(itemCheckout)
            }
        }
        return {
            checkout_info,
            shop_order_ids,
            shop_order_ids_new
        }

    }
}

module.exports = CheckoutService