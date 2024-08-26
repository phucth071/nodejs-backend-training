'use strict'

const { model, Schema } = require('mongoose'); 

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts';

var discountSchema = new Schema({
    discount_name : {type: String, required: true},
    discount_description : {type: String},
    discount_code : {type: String, required: true},
    discount_type : {type: String, default: 'fixed_amount'}, // 'fixed_amount' or 'percentage'
    discount_value : {type: Number, required: true},
    discount_start : {type: Date, required: true},
    discount_end : {type: Date, required: true},
    discount_status : {type: Boolean, default: true},
    discount_limit : {type: Number, default: 1},
    discount_used : {type: Number, default: 0},
    discount_used_by : {type: Array, default: []},
    discount_max_use_per_user : {type: Number, required: true},
    discount_min_order_value : {type: Number, required: true},
    discount_shopId: {type: Schema.Types.ObjectId, required: true, ref: 'Shop'},
    discount_apply_to: {type: String, required: true, enum: ['all', 'specific_products', 'specific_categories']},
    discount_product_ids: {type: Array, default: []},
}, {timestamps: true, collection: COLLECTION_NAME});

module.exports = {
    discount: model(DOCUMENT_NAME, discountSchema)
};