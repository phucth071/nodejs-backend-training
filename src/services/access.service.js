'use strict'

const shopModel = require("../models/shop.model");

const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const keyTokenService = require("./keytoken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils/index");
const { ConflictRequestError ,BadRequestError } = require("../core/error.response");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static signUp = async ({ name, email, password }) => {
        // try {
            console.log(`[Service]::signUp::`, { name, email, password })

            const holderShop = await shopModel.findOne({email}).lean();
            if (holderShop) {
                throw new BadRequestError('Error: Email already exists')
            }

            const hasedPassword = await bcrypt.hash(password, 10, (err, hash) => {});

            const shop = await shopModel.create({
                name,
                email,
                hasedPassword,
                roles: [RoleShop.SHOP]
            });

            if (shop) {
                // create privateKey, publicKey
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // });
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                console.log('Create key pair: ', { privateKey, publicKey});

                const keyStore = await keyTokenService.createKeyToken({
                    userId: shop._id,
                    publicKey,
                    privateKey
                });

                if (!keyStore) {
                    // throw new BadRequestError('Error: Email already exists')
                    return {
                        code: 'xxx',
                        message: 'Error create publicKey'
                    }
                }
            

                const tokens = await createTokenPair(
                    {userId: shop._id, email: email},
                    publicKey,
                    privateKey
                )
                
                // console.log('Create token pair: ', tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: shop }),
                        tokens
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }
            
        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }

}

module.exports = AccessService;