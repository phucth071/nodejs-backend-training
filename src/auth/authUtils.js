'use strict'

const HEADERS = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-refresh-token'
}

const jwt = require('jsonwebtoken');

const { AuthFailureError, NotFoundError } = require('../core/error.response');

const keyTokenService = require('../services/keytoken.service');
const { asyncHandler } = require('../helpers/asyncHandler');

const removeBearerPrefix = (token) => {
    if (token.startsWith('Bearer ')) {
        return token.slice(7); // Remove "Bearer " prefix
    }
    return token;
}

const createTokenPair = async ( payload, publicKey, privateKey ) => {
    try {
        const accessToken = await jwt.sign(payload, publicKey, { 
            expiresIn: '2 days' 
        });

        const refreshToken = await jwt.sign(payload, privateKey, { 
            expiresIn: '7 days' 
        });

        jwt.verify( accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('Error:: ', err);
            } else {
                console.log('Decode verify:: ', decode);
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        return error.message;
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /* 
        1 - Check userId exists
        2 - Check accessToken exists
        3 - Check accessToken is valid
        4 - Check user in database
        5 - Check keyToken in database
        6 - return next()
    */

    const userId = req.headers[HEADERS.CLIENT_ID];
    if (!userId) {
        throw new AuthFailureError('Error: User not found');
    }

    const keyStore = await keyTokenService.findByUserId(userId);
    if (!keyStore) {
        throw new NotFoundError('Error: KeyStore not found');
    }

    const accessToken = req.headers[HEADERS.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthFailureError('Error: Access token not found');
    }

    accessToken = removeBearerPrefix(accessToken);

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid User');
        }
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
    /* 
        1 - Check userId exists
        2 - Check accessToken exists
        3 - Check accessToken is valid
        4 - Check user in database
        5 - Check keyToken in database
        6 - return next()
    */

    const userId = req.headers[HEADERS.CLIENT_ID];
    if (!userId) {
        throw new AuthFailureError('Error: User not found');
    }

    const keyStore = await keyTokenService.findByUserId(userId);
    if (!keyStore) {
        throw new NotFoundError('Error: KeyStore not found');
    }

    console.log('x-refresh-token: ', req.headers[HEADERS.REFRESHTOKEN]);

    if (req.headers[HEADERS.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADERS.REFRESHTOKEN];
            const decodeUser = jwt.verify(refreshToken, keyStore.privateKey);
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError('Invalid User');
            }
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[HEADERS.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthFailureError('Error: Access token not found');
    }

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid User');
        }
        req.keyStore = keyStore;
        req.user = decodeUser;
    
        return next();
    } catch (error) {
        throw error;
    }
})


const verifyJWT = (token, keySecret) => {
    return jwt.verify(token, keySecret);
}

module.exports = { createTokenPair, authentication, verifyJWT, authenticationV2 }