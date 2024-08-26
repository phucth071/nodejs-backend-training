'use strict'

const express = require('express');
const router = express.Router();

const checkoutController = require('../../controllers/checkout.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const { asyncHandler } = require('../../helpers/asyncHandler');

router.get('/review', asyncHandler(checkoutController.checkoutReview));

module.exports = router;