'use strict'

const { Created, SuccessResponse } = require('../core/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
    
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create discount code successfully!',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    }
    
    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all discount code!',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getAllProductsByDiscountCode = async (req, res, next) => {
        const { code, shopId, limit, page } = req.query;
        new SuccessResponse({
            message: 'Get all products by discount code successfully!',
            metadata: await DiscountService.getAllProductsByDiscountCode(
                code, shopId, limit, page
            )
        }).send(res);
    }

    getDiscountAmount = async (req, res, next) => {
        const { code, shopId, userId, products } = req.body;
        new SuccessResponse({
            message: 'Get discount amount successfully!',
            metadata: await DiscountService.getDiscountAmount(
                code, shopId, userId, products
            )
        }).send(res);
    }

    disableDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Disable discount code successfully!',
            metadata: await DiscountService.disableDiscountCode({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    }

    deleteDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete discount code successfully!',
            metadata: await DiscountService.deleteDiscountCode({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    }
}


module.exports = DiscountController;