'use strict'

const express = require('express');
const router = express.Router();

const ProductController = require('../../controllers/product.controller');
const { authenticationV2 } = require('../../auth/authUtils');
const { asyncHandler } = require('../../helpers/asyncHandler');

const productController = new ProductController();

router.get('/search/:keyword', asyncHandler(productController.searchProduct));
router.get('', asyncHandler(productController.getAllProduct));
router.get('/:product_id', asyncHandler(productController.getProduct));



// Auth Middleware
router.use(authenticationV2);

// Routes
router.post('' , asyncHandler(productController.createProduct));
router.post('/publish/:id', asyncHandler(productController.publishProductById));
router.post('/unpublish/:id', asyncHandler(productController.unpublishProductById));
router.patch('/:product_id', asyncHandler(productController.updateProduct));


router.get('/draft/all', asyncHandler(productController.getAllDraftProductsOfShop));
router.get('/publish/all', asyncHandler(productController.getAllPublishProductsOfShop));

module.exports = router;