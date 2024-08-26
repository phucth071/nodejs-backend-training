'use strict'

const shopModel = require("../models/shop.model")

const findByEmail = async (email, select = {
    email: 1, roles: 1, password: 1, status: 1, name: 1
    
}) => {
    return await shopModel.findOne({ email }).lean()
}

module.exports = { findByEmail }