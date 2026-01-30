const orderService = require('../services/order.services');
const razorpayService = require('../services/razorpay.services');

// ======================== ORDER CONTROLLERS ========================

const getOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, userId, search, startDate, endDate, skip, take } = req.query;

    const result = await orderService.getOrders({
      status,
      paymentStatus,
      userId,
      search,
      startDate,
      endDate,
      skip,
      take
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await orderService.getOrderById(orderId);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// ======================== ORDER STATUS CONTROLLERS ========================

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const result = await orderService.updateOrderStatus(orderId, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!paymentStatus) {
      return res.status(400).json({ message: 'Payment status is required' });
    }

    const result = await orderService.updatePaymentStatus(orderId, paymentStatus);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== SHIPMENT CONTROLLERS ========================

const createOrUpdateShipment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { courierName, trackingNumber, trackingUrl, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const result = await orderService.createOrUpdateShipment(orderId, {
      courierName,
      trackingNumber,
      trackingUrl,
      status
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderShipment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const shipment = await orderService.getOrderShipment(orderId);
    res.json(shipment);
  } catch (error) {
    next(error);
  }
};

// ======================== ORDER ANALYTICS CONTROLLER ========================

const getOrderAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await orderService.getOrderAnalytics({
      startDate,
      endDate
    });

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// ======================== ORDER CANCELLATION CONTROLLER ========================

const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const result = await orderService.cancelOrder(orderId, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== ORDER ITEMS CONTROLLER ========================

const getOrderItems = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const items = await orderService.getOrderItems(orderId);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// ======================== CUSTOMER-FACING ORDER CONTROLLERS ========================

const createOrderFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { addressId, paymentMethod } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({ message: 'Address ID and payment method are required' });
    }

    const result = await orderService.createOrderFromCart(userId, {
      addressId,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { status, skip, take } = req.query;

    const result = await orderService.getCustomerOrders(userId, {
      status,
      skip,
      take
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerOrderDetail = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await orderService.getCustomerOrderDetail(userId, orderId);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const tracking = await orderService.trackOrder(userId, orderId);

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    next(error);
  }
};

const cancelCustomerOrder = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const result = await orderService.cancelCustomerOrder(userId, orderId, reason);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ======================== PAYMENT CONTROLLERS ========================

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters'
      });
    }

    // Verify payment signature
    const verification = await razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);

    // Verify payment status
    if (paymentDetails.status !== 'authorized' && paymentDetails.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not authorized',
        paymentStatus: paymentDetails.status
      });
    }

    // If payment is authorized, capture it
    if (paymentDetails.status === 'authorized') {
      await razorpayService.capturePayment(razorpayPaymentId, paymentDetails.amount);
    }

    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      data: {
        razorpayOrderId,
        razorpayPaymentId,
        amount: paymentDetails.amount,
        status: 'captured'
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};

const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Validate webhook signature
    const rawBody = JSON.stringify(body);
    const isValidSignature = razorpayService.validateWebhookSignature(rawBody, signature);

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Process webhook
    const event = body.event;
    const payload = body.payload;

    console.log('Processing webhook event:', event);

    const result = await razorpayService.processPaymentWebhook({
      event,
      payload
    });

    res.json({
      success: true,
      message: 'Webhook processed',
      data: result
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to Razorpay so it doesn't retry
    res.status(200).json({
      success: false,
      message: error.message || 'Webhook processing failed'
    });
  }
};

module.exports = {
  // Admin Order Management
  getOrders,
  getOrderById,
  // Admin Status Management
  updateOrderStatus,
  updatePaymentStatus,
  // Admin Shipment Management
  createOrUpdateShipment,
  getOrderShipment,
  // Admin Analytics
  getOrderAnalytics,
  // Admin Cancellation
  cancelOrder,
  // Items
  getOrderItems,
  // Customer-facing endpoints
  createOrderFromCart,
  getCustomerOrders,
  getCustomerOrderDetail,
  trackOrder,
  cancelCustomerOrder,
  // Payment endpoints
  verifyPayment,
  razorpayWebhook
};
