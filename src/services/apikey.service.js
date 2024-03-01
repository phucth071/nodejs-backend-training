'use strict'

const apikeyModel = require("../models/apikey.model")

const crypto = require('crypto')

const findById = async ( key ) => {
    // const newKey = await apikeyModel.create({ key: crypto.randomBytes(64).toString('hex'), status: true, permissions: ['0000']})
    // console.log('newKey: ', newKey)
    const objkey = await apikeyModel.findOne({ key: key, status: true }).lean()
    return objkey
}

module.exports = {
    findById
}