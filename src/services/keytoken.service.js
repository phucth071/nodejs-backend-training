'use strict'

const keyTokenModel = require('../models/keyToken.model');

class keyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey}) => {
        try {
            const tokens = await keyTokenModel.create({
                user: userId,
                publicKey,
                privateKey
            });

            return tokens ? publicKeyString : null;
        } catch (error) {
            return error
        }
    }
}

module.exports = keyTokenService;