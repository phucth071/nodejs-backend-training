'use strict'

const shopModel = require("../models/shop.model");

const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const keyTokenService = require("./keytoken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils/index");
const { ConflictRequestError , BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");

// Service
const { findByEmail } = require("./shop.service");
const generateKeyPair = require("../utils/generateKeyPair");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /*
        1. Check email exists
        2. Check password
        3. Create token pair (access, refresh)
        4. Generate tokens
        5. Get data and return
     */
    static handleRefreshToken = async ( refreshToken ) => {
        const foundToken = await keyTokenService.findByRefreshTokenUsed(refreshToken);
        if (foundToken) {
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
            await keyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Error: Token is invalid! Pls relogin');
        }

        
        const holderToken = await keyTokenService.findByRefreshToken( refreshToken );
        console.log('Holder token: ', holderToken);

        if (!holderToken) { 
            throw new AuthFailureError('Error: Token is invalid 2');
        }

        const { userId, email } = verifyJWT(refreshToken, holderToken.privateKey);
        console.log('Verify User: ', { userId, email });
        // console.log('Verify User: ', { userId, email });

        const foundShop = await findByEmail(email);
        if (!foundShop) {
            throw new BadRequestError('Error: User not found');
        }

        //create new token pair
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        )

        //update refresh token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }

    static handleRefreshTokenV2 = async ({ refreshToken, keyStore, user }) => {

        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await keyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Error: Token is invalid! Pls relogin');
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered');
        }

        const foundShop = await findByEmail(email);
        if (!foundShop) {
            throw new BadRequestError('Error: User not found');
        }

        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        )

        //update refresh token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user,
            tokens
        }

    }

    static login = async ({ email, password, refeshToken = null }) => {
        const foundShop = await findByEmail(email);
        if (!foundShop) {
            throw new BadRequestError('Error: Email not found')
        }
        const userId = foundShop._id;
        console.log('Found shop: ', foundShop);
        console.log('Found shop pw: ', foundShop.password);
        const match = await bcrypt.compare(password, foundShop.password);
        if (!match) {
            throw new AuthFailureError('Error: Password is not correct')
        }

        const { privateKey, publicKey } = await generateKeyPair();

        const tokens = await createTokenPair(
            {userId: userId, email: email},
            publicKey,
            privateKey
        )

        await keyTokenService.createKeyToken({
            userId: userId,
            privateKey,
            publicKey,
            refreshToken: tokens.refreshToken
        })

        return {
                shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
                tokens
        }
    }

    static signUp = async ({ name, email, password }) => {
        // try {
            console.log(`[Service]::signUp::`, { name, email, password })

            const holderShop = await shopModel.findOne({email}).lean();
            if (holderShop) {
                throw new BadRequestError('Error: Email already exists')
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Hashed password: ', hashedPassword);
            const shop = await shopModel.create({
                name,
                email,
                password: hashedPassword,
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

    static logout = async(keyStore) => {
        const delKey = await keyTokenService.removeKeyById(keyStore._id);
        console.log('Delete key: ', delKey);
        return delKey;
    }

}

module.exports = AccessService;