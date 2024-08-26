'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'inventories';

// Declare the Schema of the Mongo model
var inventorySchema = new Schema({
    inven_productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    inven_location: { type: String, default: 'Main Warehouse' },
    inven_stock: { type: Number, default: 0 },
    inven_shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
    inven_reservations: { type: Array, default: []}
}, {timestamps: true, collection: COLLECTION_NAME});

//Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema)
};