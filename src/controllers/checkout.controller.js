'use strict'

const { Created, SuccessResponse } = require('../core/success.response');
const CheckoutService  = require('../services/checkout.service');

class CheckoutController {
    checkoutReview = async (req, res, next) => {
        const { cartId, userId, shop_order_ids } = req.body;
        new SuccessResponse({
            message: 'Add to cart successfully!',
            metadata: await CheckoutService.checkoutReview(cartId, userId, shop_order_ids)
        }).send(res);
    }

}
module.exports = new CheckoutController();