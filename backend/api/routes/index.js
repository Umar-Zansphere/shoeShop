const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');
const sessionRoutes = require('./session.routes');
const orderTrackingRoutes = require('./orderTracking.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/session', sessionRoutes);
router.use('/orders/track', orderTrackingRoutes);

module.exports = router;

