'use strict'

const { model, Schema, Types } = require('mongoose');
const { discount } = require('../discount.model');
const { unGetSelectData, getSelectData } = require('../../utils/index')

class DiscountRepository {
    static findAllDiscountCodesUnselect = async (
        limit = 50, page = 1, sort = 'ctime', filter, unSelect
    ) => {
        const skip = (page - 1) * limit
        const sortBy = sort === 'ctime' ? {_id: -1} : {_id: -1}
        return await discount.find(filter)
        .sort(sortBy)
        .limit(limit)
        .skip(skip)
        .select(unGetSelectData(unSelect))
        .lean()
        .exec()
    }

    static findAllDiscountCodesSelect = async (
        limit = 50, page = 1, sort = 'ctime', filter, select
    ) => {
        const skip = (page - 1) * limit
        const sortBy = sort === 'ctime' ? {_id: -1} : {_id: -1}
        return await discount.find(filter)
        .sort(sortBy)
        .limit(limit)
        .skip(skip)
        .select(getSelectData(select))
        .lean()
        .exec()
    }

    static findDiscountByCode = async (code, shopId) => {
        return await discount.findOne({
            discount_code: code,
            discount_shopId: shopId
        }).lean()
    }
}

module.exports = DiscountRepository;