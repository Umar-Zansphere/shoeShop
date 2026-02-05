const adminOrderService = require('../services/adminOrder.services');
const razorpayService = require('../services/razorpay.services');

// ======================== ORDER CONTROLLERS ========================

const getOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, userId, search, startDate, endDate, skip, take } = req.query;

    const result = await adminOrderService.getOrders({
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

    const order = await adminOrderService.getOrderById(orderId);
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

    const result = await adminOrderService.updateOrderStatus(orderId, status);
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

    const result = await adminOrderService.updatePaymentStatus(orderId, paymentStatus);
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

    const result = await adminOrderService.createOrUpdateShipment(orderId, {
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

    const shipment = await adminOrderService.getOrderShipment(orderId);
    res.json(shipment);
  } catch (error) {
    next(error);
  }
};

// ======================== ORDER ANALYTICS CONTROLLER ========================

const getOrderAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await adminOrderService.getOrderAnalytics({
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

    const result = await adminOrderService.cancelOrder(orderId, reason);
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

    const items = await adminOrderService.getOrderItems(orderId);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  createOrUpdateShipment,
  getOrderShipment,
  getOrderAnalytics,
  cancelOrder,
  getOrderItems
};