'use strict'

const { max } = require('lodash');
const { model, Schema } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'products';

const productSchema = new Schema({
    product_name: {type: String, required: true},
    product_thumb: {type: String, required: true},
    product_price: {type: Number, required: true},
    product_description: String,
    product_rating: {type: Number, default: 1, min: [1, "Rating must be above 1.0"], max: [5, "Rating must be below 5.0"], set: (val) => Math.round(val * 10) / 10},
    product_slug: String,
    product_quantity: {type: Number, required: true},
    product_type: {type: String, required: true, enum: ['Electronics', 'Clothing', 'Books', 'Furniture', 'Others']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: {type: Schema.Types.Mixed, required: true},
    product_variants: {type: Schema.Types.Mixed},
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublished: {type: Boolean, default: false, index: true, select: false},

}, {
    collection: COLLECTION_NAME,
    timestamps: true
})
// Create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Middleware
productSchema.pre('save', function( next ) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})

// define product type
const electronicSchema = new Schema({
    manufacturer : {type: String, required: true},
    model: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'electronics',
    timestamps: true
})

const clothingSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'clothing',
    timestamps: true
})

const bookSchema = new Schema({
    author: {type: String, required: true},
    genre: {type: String, required: true},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'books',
    timestamps: true
})

const furnitureSchema = new Schema({
    brand: {type: String, required: true},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}
}, {
    collection: 'furnitures',
    timestamps: true
})

module.exports = { 
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronic', electronicSchema),
    clothing: model('Clothing', clothingSchema),
    book: model('Book', bookSchema),
    furniture: model('Furniture', furnitureSchema)
}