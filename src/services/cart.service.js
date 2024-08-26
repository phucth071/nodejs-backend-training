'use strict'

const { cart } = require('../models/cart.model')
const { BadRequestError, ForbiddenError, NotFoundError } = require('../core/error.response')
const { default: mongoose } = require('mongoose')
const  CartRepository  = require('../models/repositories/cart.repository')
const  ProductRepository  = require('../models/repositories/product.repository')

class CartService {
    static async createCart({ userId, product = {} }) {
        return await CartRepository.createCart({ userId, product })
    }

    static async findCartByUserId({ userId }) {
        return await CartRepository.findCartByUserId({ userId })
    }

    static async addToCart({ userId, product = {}}) {
        let foundCart = await CartRepository.findCartByUserId({ userId })
        if (!foundCart) {
            return await CartRepository.createCart({ userId, product })
        }

        if (!(foundCart instanceof cart)) {
            foundCart = await cart.findById(foundCart._id);
        }

        if (!foundCart.cart_products.length) {
            foundCart.cart_products = [product]
            return await foundCart.save()
        }

        return await CartRepository.updateQuantity({ userId, product })
    }

    static async updateCart({ userId, shop_order_ids}) {
        const { product_id, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]

        const foundProduct = await ProductRepository.findProduct( {product_id, unSelect: ['isDraft', 'isPublished', '__v']} )
        
        console.log("PRODUCT ID::: ", product_id)

        if (!foundProduct) {
            throw new NotFoundError('Product not found')
        }

        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError("This product does not longer belong to this shop")
        }

        if (quantity < 1) {
            // delete product
        }

        const new_quantity = quantity - old_quantity


        return await CartRepository.updateQuantity({ userId, product: {
            product_id,
            product_quantity: new_quantity
        }})
    }

    static async deleteProduct({ userId, product = {}}) {
        // return await CartRepository.deleteProduct({ userId, product })
        const query = {
            cart_userId: userId,
            cart_state: 'active'
        }, updateSet = {
            $pull: {
                cart_products: { product_id: product.product_id }
            }
        }

        const deleteProductCart = await cart.updateOne(query, updateSet)

        return deleteProductCart
        
    }
}

module.exports = CartService