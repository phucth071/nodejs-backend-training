'use strict'

const { Types } = require('mongoose');
const keyTokenModel = require('../models/keytoken.model');
const ObjectId = require('mongoose').Types.ObjectId;

class keyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // });

            // return tokens ? publicKeyString : null;

            // Advanced
            const filter = { user: userId }, update = { 
                publicKey, privateKey, refreshTokensUses: [], refreshToken 
            }, options = { upsert: true, new: true };
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: userId });
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: id });
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
    }

    static deleteKeyById = async (userId) => {
        const id = new ObjectId(userId);
        return await keyTokenModel.deleteOne({ user: id })
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken })
    }
}

module.exports = keyTokenService;