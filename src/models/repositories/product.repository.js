'use strict'

const { product, electronic, clothing, book, furniture} = require('../product.model')
const { BadRequestError, ForbiddenError } = require('../../core/error.response')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils/index')

class ProductRepository {
    static queryProduct = async ( {query, limit, skip} ) => {
        return await product.find(query)
            .populate('product_shop', 'name email -_id')
            .sort( {updateAt: -1} )
            .limit(limit)
            .skip(skip)
            .lean()
            .exec()
    }

    static findAllDraftProductsOfShop = async ( {query, limit, skip} ) => {
        return await this.queryProduct( {query, limit, skip} )
    }

    static findAllPublishProductsOfShop = async ( {query, limit, skip} ) => {
        return await this.queryProduct( {query, limit, skip} )
    } 

    static searchProduct = async ( {keyword, limit, skip} ) => {
        const regex = new RegExp(keyword, 'i');
        const result = await product.find({
            "$or": 
            [
                {"product_name": {"$regex": regex}}, 
                {"product_description": {"$regex": regex}}
            ]
        })
        .limit(limit)
        .skip(skip)
        .lean()
        .exec()

        return result
    }

    static findAllProducts = async ( {limit, sort, filter, page, select} ) => {
        const skip = (page - 1) * limit
        const sortBy = sort === 'ctime' ? {_id: -1} : {product_price: -1}
        return await product.find(filter)
        .sort(sortBy)
        .limit(limit)
        .skip(skip)
        .select(getSelectData(select))
        .lean()
        .exec()
    }

    static findProduct = async ( {product_id, unSelect = []} ) => {
        return await product.findById(product_id)
        .select(unGetSelectData(unSelect))
    }

    static updateProductById = async ( {product_id, bodyUpdate, model, isNew = true} ) => {
        return await model.findByIdAndUpdate(product_id, bodyUpdate, {new: isNew})
    }

    static publishProductById = async ( {product_shop, product_id} ) => {
        const foundProduct = await product.findOne({
            product_shop: new Types.ObjectId(product_shop),
            _id: new Types.ObjectId(product_id)
        })

        if (!foundProduct) throw new BadRequestError('Product not found')
        
        foundProduct.isDraft = false
        foundProduct.isPublished = true

        return await foundProduct.save()
    }

    static unpublishProductById = async ( {product_shop, product_id} ) => {
        const foundProduct = await product.findOne({
            product_shop: new Types.ObjectId(product_shop),
            _id: new Types.ObjectId(product_id)
        })

        if (!foundProduct) throw new BadRequestError('Product not found')
        
        foundProduct.isDraft = true
        foundProduct.isPublished = false

        return await foundProduct.save()
    }

    // Check if product is available (the price is the same, ...)
    static checkProductAvailable = async ( products ) => {
        return await Promise.all( products.map( async product => {
            const foundProduct = await this.findProduct( {product_id: product.product_id, unSelect: []} )
            if (foundProduct) {
                return {
                    product_id: foundProduct._id,
                    product_price: foundProduct.product_price,
                    product_quantity: product.quantity
                }
            }
        }))
    }
}


module.exports = ProductRepository
