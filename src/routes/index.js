'use strict'

const express = require('express');
const { apiKey, permissions } = require('../auth/checkAuth');
const router = express.Router();

// Check apikey
router.use(apiKey)
router.use(permissions('0000'))

router.use('/v1/api/cart', require('./cart'));
router.use('/v1/api/product', require('./product'));
router.use('/v1/api/discount', require('./discount'));
router.use('/v1/api/checkout', require('./checkout'));

router.use('/v1/api/', require('./access'));
// router.get('/', (req, res, next) => {
//     return res.status(200).json({
//         message: 'Welcome to SHOP'
//     });
// });

module.exports = router;