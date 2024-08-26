'use strict'

const { Created, SuccessResponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart successfully!',
            metadata: await CartService.addToCart(req.body)
        }).send(res);
    }

    updateCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update cart successfully!',
            metadata: await CartService.updateCart(req.body)
        }).send(res);
    }

    deleteProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete product successfully!',
            metadata: await CartService.deleteProduct(req.body)
        }).send(res);
    }

    getCart = async (req, res, next) => {
        console.log('USERID::: ', req.query.userId)
        new SuccessResponse({
            message: 'Get cart successfully!',
            metadata: await CartService.findCartByUserId(req.query)
        }).send(res);
    }
    
}
module.exports = new CartController();