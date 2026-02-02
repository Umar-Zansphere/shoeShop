const prisma = require('../../config/prisma');
const crypto = require('crypto');
const { generateOTP, hashOTP } = require('./auth.services');

// ======================== ORDER TRACKING ========================

/**
 * Create order tracking with OTP for phone-based tracking
 * @param {string} orderId - Order ID
 * @param {string} phone - Phone number
 * @returns {Promise<Object>} Tracking info
 */
const createOrderTracking = async (orderId, phone) => {
    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing active tracking for this order
    await prisma.orderTracking.deleteMany({
        where: {
            orderId,
            verifiedAt: null,
        },
    });

    // Create new tracking record
    await prisma.orderTracking.create({
        data: {
            orderId,
            phone,
            otpHash,
            expiresAt,
        },
    });

    const message = `Your order tracking code is: ${otp}. This code expires in 10 minutes.`;
    console.log(`[SMS OTP] Message ready for ${phone}: ${message}`);
    // TODO: Integrate SMS service (Twilio, AWS SNS, etc.)

    return {
        success: true,
        message: `Tracking code sent to ${phone}`,
        expiresIn: 600,
    };
};

/**
 * Verify OTP and get order details
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Order details
 */
const verifyOrderTracking = async (phone, otp) => {
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
        throw new Error('Invalid tracking code format.');
    }

    const otpHash = hashOTP(otp);

    // Find the active tracking record
    const tracking = await prisma.orderTracking.findFirst({
        where: {
            phone,
            verifiedAt: null,
        },
        include: {
            order: {
                include: {
                    items: {
                        include: {
                            variant: {
                                select: {
                                    size: true,
                                    color: true,
                                    images: {
                                        where: { isPrimary: true },
                                        select: { url: true, altText: true },
                                    },
                                },
                            },
                        },
                    },
                    orderAddress: true,
                    shipments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (!tracking) {
        throw new Error('No active tracking found for this phone number.');
    }

    // Check if OTP has expired
    if (new Date() > tracking.expiresAt) {
        await prisma.orderTracking.delete({
            where: { id: tracking.id },
        });
        throw new Error('Tracking code has expired. Please request a new one.');
    }

    // Verify OTP
    if (otpHash !== tracking.otpHash) {
        throw new Error('Invalid tracking code.');
    }

    // Mark as verified
    await prisma.orderTracking.update({
        where: { id: tracking.id },
        data: { verifiedAt: new Date() },
    });

    return {
        success: true,
        message: 'Order found',
        order: tracking.order,
    };
};

/**
 * Request tracking OTP for an order by order number and phone
 * @param {string} orderNumber - Order number
 * @param {string} phone - Phone number
 * @returns {Promise<Object>} Tracking request result
 */
const requestOrderTracking = async (orderNumber, phone) => {
    // Find order by order number and phone (either user phone or guest phone)
    const order = await prisma.order.findFirst({
        where: {
            orderNumber,
            OR: [
                { guestPhone: phone },
                { user: { phone } },
            ],
        },
    });

    if (!order) {
        throw new Error('Order not found with this phone number.');
    }

    return await createOrderTracking(order.id, phone);
};

/**
 * Get order status by tracking (after OTP verification)
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order status
 */
const getOrderStatus = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    variant: {
                        select: {
                            size: true,
                            color: true,
                            price: true,
                            images: {
                                where: { isPrimary: true },
                                select: { url: true, altText: true },
                            },
                        },
                    },
                },
            },
            orderAddress: true,
            shipments: {
                orderBy: { createdAt: 'desc' },
            },
            payments: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    return {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items,
        address: order.orderAddress,
        shipments: order.shipments,
        payments: order.payments,
    };
};

module.exports = {
    createOrderTracking,
    verifyOrderTracking,
    requestOrderTracking,
    getOrderStatus,
};
