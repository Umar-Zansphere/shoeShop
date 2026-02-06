const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const sessionRoutes = require('./session.routes');
const notificationRoutes = require('./notifications.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/session', sessionRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
