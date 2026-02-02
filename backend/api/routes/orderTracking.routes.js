const express = require('express');
const router = express.Router();
const orderTrackingService = require('../services/orderTracking.services');

// ======================== ORDER TRACKING ROUTES ========================

// Request tracking OTP by order number and phone
router.post('/request', async (req, res, next) => {
    try {
        const { orderNumber, phone } = req.body;

        if (!orderNumber || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Order number and phone number are required',
                toast: {
                    type: 'error',
                    message: 'Please provide order number and phone number',
                },
            });
        }

        const result = await orderTrackingService.requestOrderTracking(orderNumber, phone);

        res.json({
            ...result,
            toast: {
                type: 'success',
                message: result.message,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Verify OTP and get order details
router.post('/verify', async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required',
                toast: {
                    type: 'error',
                    message: 'Please provide phone number and OTP',
                },
            });
        }

        const result = await orderTrackingService.verifyOrderTracking(phone, otp);

        res.json({
            ...result,
            toast: {
                type: 'success',
                message: 'Order found successfully',
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get order status (after OTP verification)
router.get('/:orderId/status', async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        const result = await orderTrackingService.getOrderStatus(orderId);

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
