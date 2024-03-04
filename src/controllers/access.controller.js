'use strict'

const { Created } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
    signUp = async (req, res, next) => {
        new Created({
            message: 'Register successfully!',
            metadata: await AccessService.signUp(req.body)
        }).send(res);
    }
}
module.exports = AccessController;