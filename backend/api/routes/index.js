const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const sessionRoutes = require('./session.routes');
const notificationRoutes = require('./notifications.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const userRoutes = require('./user.routes');
const orderRoutes = require('./order.routes');
const productRoutes = require('./product.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/session', sessionRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/products', productRoutes);

module.exports = router;
