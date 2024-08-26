'use strict'

const express = require('express');
const router = express.Router();

const DiscountController = require('../../controllers/discount.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const { asyncHandler } = require('../../helpers/asyncHandler');

const discountController = new DiscountController();

router.get('/amount', asyncHandler(discountController.getDiscountAmount));
router.get('/products', asyncHandler(discountController.getAllProductsByDiscountCode));

// Auth Middleware
router.use(authenticationV2);

router.post('' , asyncHandler(discountController.createDiscountCode));
router.get('' , asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;