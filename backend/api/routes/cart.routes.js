const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(verifyToken);

// ======================== CART ROUTES ========================

// Get cart
router.get('/', cartController.getCart);

// Get cart summary with totals
router.get('/summary', cartController.getCartSummary);

// Add to cart
router.post('/', cartController.addToCart);

// Update cart item quantity
router.patch('/:cartItemId', cartController.updateCartItem);

// Remove from cart
router.delete('/:cartItemId', cartController.removeFromCart);

// Clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;
