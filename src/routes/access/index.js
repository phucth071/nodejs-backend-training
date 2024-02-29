'use strict'

const express = require('express');
const router = express.Router();

const AccessController = require('../../controllers/access.controller');
const accessController = new AccessController();

router.post('/shop/signup', (req, res, next) => {
    accessController.signUp(req, res, next)
});

module.exports = router;