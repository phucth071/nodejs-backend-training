'use strict'

const { Created, SuccessResponse } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
    
    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login successfully!',
            metadata: await AccessService.login(req.body)
        }).send(res);
    }

    signUp = async (req, res, next) => {
        new Created({
            message: 'Register successfully!',
            metadata: await AccessService.signUp(req.body)
        }).send(res);
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout successfully!',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    handleRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Refresh token successfully!',
        //     metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res);

        //V2 - fixed
        new SuccessResponse({
            message: 'Refresh token successfully!',
            metadata: await AccessService.handleRefreshTokenV2({
                refreshToken: req.refreshToken,
                keyStore: req.keyStore,
                user: req.user
            })
        }).send(res);
    }
}
module.exports = AccessController;