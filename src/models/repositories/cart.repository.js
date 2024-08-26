'use strict'

const { BadRequestError, NotFoundError } = require('../../core/error.response')
const { cart } = require('../cart.model')

class CartRepository {
    static async createCart({ userId, product = {} }) {
        const query = {
            cart_userId: userId,
            cart_state: 'active'
        }

        const updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async findCartByUserId({ userId }) {
        return await cart.findOne({ cart_userId: userId, cart_state: 'active' }).lean()
    }

    static async updateQuantity({ userId, product = {} }) {
        const { product_id, product_quantity } = product
        const query = {
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.product_id': product_id
        }

        const update = {
            $inc: {
                'cart_products.$.product_quantity': product_quantity
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, update, options);
    }

    static async deleteProduct({ userId, productId }) {
        const query = {
            cart_userId: userId,
            cart_state: 'active'
        }

        const update = {
            $pull: {
                cart_products: { productId }
            }
        }, options = { new: true }

        return await cart.updateOne(query, update, options)
    }

}

module.exports = CartRepository