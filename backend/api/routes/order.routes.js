const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

// ======================== ADMIN ROUTES (Protected by admin middleware) ========================

// Get all orders (admin only)
router.get('/admin/all', verifyToken, verifyAdmin, orderController.getOrders);

// Get order by ID (admin only)
router.get('/admin/:orderId', verifyToken, verifyAdmin, orderController.getOrderById);

// Update order status (admin only)
router.put('/admin/:orderId/status', verifyToken, verifyAdmin, orderController.updateOrderStatus);

// Update payment status (admin only)
router.put('/admin/:orderId/payment-status', verifyToken, verifyAdmin, orderController.updatePaymentStatus);

// Create/Update shipment (admin only)
router.post('/admin/:orderId/shipment', verifyToken, verifyAdmin, orderController.createOrUpdateShipment);

// Get shipment (admin only)
router.get('/admin/:orderId/shipment', verifyToken, verifyAdmin, orderController.getOrderShipment);

// Get order analytics (admin only)
router.get('/admin/analytics', verifyToken, verifyAdmin, orderController.getOrderAnalytics);

// Cancel order (admin only)
router.post('/admin/:orderId/cancel', verifyToken, verifyAdmin, orderController.cancelOrder);

// Get order items (admin only)
router.get('/admin/:orderId/items', verifyToken, verifyAdmin, orderController.getOrderItems);

// ======================== CUSTOMER ROUTES (Protected by auth middleware) ========================

// Create order from cart (checkout)
router.post('/', verifyToken, orderController.createOrderFromCart);

// Get all orders for logged-in customer
router.get('/', verifyToken, orderController.getCustomerOrders);

// Get order detail for customer
router.get('/:orderId', verifyToken, orderController.getCustomerOrderDetail);

// Track order
router.get('/:orderId/track', verifyToken, orderController.trackOrder);

// Cancel order (customer can only cancel pending orders)
router.post('/:orderId/cancel', verifyToken, orderController.cancelCustomerOrder);

// ======================== PAYMENT ROUTES ========================

// Verify Razorpay payment
router.post('/payment/verify', verifyToken, orderController.verifyPayment);

// Razorpay webhook (no auth required - verified by signature)
router.post('/webhook/razorpay', orderController.razorpayWebhook);

module.exports = router;
