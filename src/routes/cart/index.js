'use strict'

const express = require('express');
const router = express.Router();

const cartController = require('../../controllers/cart.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const { asyncHandler } = require('../../helpers/asyncHandler');

router.get('', asyncHandler(cartController.getCart));
router.post('', asyncHandler(cartController.addToCart));
router.post('/update', asyncHandler(cartController.updateCart));
router.delete('', asyncHandler(cartController.deleteProduct));

module.exports = router;