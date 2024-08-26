'use strict'

const HEADERS = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}
    
const { ForbiddenError } = require('../core/error.response');
const { asyncHandler } = require('../helpers/asyncHandler');
const { findById } = require('../services/apikey.service');

const apiKey = asyncHandler(async(req, res, next) => {
    try {
        const key = req.headers[HEADERS.API_KEY]?.toString();
        if (!key) {
            throw new ForbiddenError('Forbidden Error');
        }
        // check objkey
        const objkey = await findById(key);
        if (!objkey) {
            throw new ForbiddenError('Forbidden Error');
        }

        req.objkey = objkey;
        return next()
    
    } catch (error) {
        throw error
    }
})

const permissions = (permissions) => {
    return (req, res, next) => {
        if (!req.objkey.permissions) {
            return res.status(403).json({
                message: 'Permission denied'
            })
        }

        console.log('permissions: ', req.objkey.permissions)

        const validPermissions = req.objkey.permissions.includes(permissions);
        if (!validPermissions) {
            return res.status(403).json({
                message: 'Permission denied'
            })
        }

        return next()

    }
}

module.exports = { apiKey, permissions };