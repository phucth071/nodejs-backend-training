'use strict'

const { BadRequestError, ForbiddenError } = require('../core/error.response')
const { SuccessResponse } = require('../core/success.response')
const { product } = require('../models/product.model')
const { ProductService } = require('../services/product.service')

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product successfully!',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                //product_shop: req.headers['x-client-id']
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all products successfully!',
            metadata: await ProductService.findAllProducts(req.query)
        }).send(res)
    }

    getProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get product successfully!',
            metadata: await ProductService.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }

    updateProduct = async (req, res, next) => {
        const updatedProduct = await ProductService.updateProduct(req.body.product_type, req.params.product_id, {
            ...req.body,
            product_shop: req.user.userId
        });
    
        new SuccessResponse({
            message: 'Update product successfully!',
            metadata: updatedProduct
        }).send(res);
    }

    getAllDraftProductsOfShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all draft products of shop successfully!',
            metadata: await ProductService.findAllDraftProductsOfShop({ product_shop: req.user.userId })
        }).send(res)
    }

    getAllPublishProductsOfShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all draft products of shop successfully!',
            metadata: await ProductService.findAllPublishProductsOfShop({ product_shop: req.user.userId })
        }).send(res)
    }

    searchProduct = async (req, res, next) => {
        console.log("KEY::: ", req.params.keyword)
        new SuccessResponse({
            message: 'Search successfully!',
            metadata: await ProductService.searchProduct({ 
                key: req.params.keyword 
            })
        }).send(res)
    }

    publishProductById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product successfully!',
            metadata: await ProductService.publishProductById({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    unpublishProductById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product successfully!',
            metadata: await ProductService.unpublishProductById({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }
}

module.exports = ProductController;