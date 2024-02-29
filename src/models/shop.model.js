'use strict'

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'Shops';

// Declare the Schema of the Mongo model
var shopSchema = new Schema({
    name:{
        type: String,
        trim: true,
        maxLenght: 100,
        require: true
    },
    email:{
        type: String,
        unique: true,
        trim: true,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    status: {
        type: Schema.Types.Boolean,
        default: false
    },
    verify: {
        type: Schema.Types.Boolean,
        default: false
    },
    roles: {
        type: Array,
        default: []
    }
}, {
    timestamps: true, 
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);