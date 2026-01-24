const orderService = require('../services/order.services');

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

module.exports = {
  // Order
  getOrders,
  getOrderById,
  // Status
  updateOrderStatus,
  updatePaymentStatus,
  // Shipment
  createOrUpdateShipment,
  getOrderShipment,
  // Analytics
  getOrderAnalytics,
  // Cancellation
  cancelOrder,
  // Items
  getOrderItems
};
