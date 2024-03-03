'use strict'

const express = require('express');
const router = express.Router();

const AccessController = require('../../controllers/access.controller');
const { asyncMiddleware } = require('../../auth/checkAuth');
const accessController = new AccessController();

router.post('/shop/signup', asyncMiddleware(accessController.signUp));

module.exports = router;