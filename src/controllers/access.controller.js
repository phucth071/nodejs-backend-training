'use strict'

const AccessService = require('../services/access.service');

class AccessController {
    signUp = async (req, res, next) => {
            const user = await AccessService.signUp(req.body);
            res.status(201).json(user);
    }
}
module.exports = AccessController;