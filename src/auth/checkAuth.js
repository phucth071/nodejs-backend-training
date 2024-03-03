'use strict'

const HEADERS = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}
    
const { findById } = require('../services/apikey.service');

const apiKey = async(req, res, next) => {
    try {
        const key = req.headers[HEADERS.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: 'Forbidden Error'
            });
        }
        // check objkey
        const objkey = await findById(key);
        if (!objkey) {
            return res.status(403).json({
                message: 'Forbidden Error'
            });
        }

        req.objkey = objkey;
        return next()
    
    } catch (error) {
        
    }
}

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

const asyncMiddleware = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

module.exports = { apiKey, permissions, asyncMiddleware };