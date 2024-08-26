'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'carts';

var cartSchema = new Schema({
    cart_state: {
        type: String, 
        required: true, 
        enum: ['active', 'inactive', 'completed', 'pending'], 
        default: 'active'
    },
    cart_products: {type: Array, required: true, default: []},
    cart_products_count: {type: Number, required: true, default: 0},
    cart_userId: {type: Types.ObjectId, required: true},
}, {timestamps: true, collection: COLLECTION_NAME});


module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
};