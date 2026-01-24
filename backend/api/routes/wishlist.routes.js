const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All wishlist routes require authentication
router.use(verifyToken);

// ======================== WISHLIST ROUTES ========================

// Get wishlist
router.get('/', cartController.getWishlist);

// Add to wishlist
router.post('/', cartController.addToWishlist);

// Remove from wishlist
router.delete('/:wishlistItemId', cartController.removeFromWishlist);

// Move wishlist item to cart
router.post('/:wishlistItemId/move-to-cart', cartController.moveToCart);

// Clear entire wishlist
router.delete('/', cartController.clearWishlist);

module.exports = router;
