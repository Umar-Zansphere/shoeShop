const prisma = require('../../config/prisma');
const razorpayService = require('./razorpay.services');
const { sendEmail } = require('../../config/email');
const {generateTokens} = require('../services/auth.services');

// ======================== ORDER CRUD ========================

const getOrders = async (filters = {}) => {
  const { status, paymentStatus, userId, search, startDate, endDate, skip = 0, take = 10 } = filters;

  const where = {};

  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (userId) where.userId = userId;

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        items: { include: { variant: true } },
        payments: true,
        shipments: true,
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      total,
      skip: parseInt(skip),
      take: parseInt(take),
      pages: Math.ceil(total / take)
    }
  };
};

const getOrderById = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true, fullName: true, phone: true } },
      items: {
        include: {
          variant: { include: { product: true } }
        }
      },
      payments: true,
      shipments: true,
      orderAddress: true,
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

/**
 * Get order by tracking token (public read-only access)
 * @param {string} trackingToken - Unique tracking token
 * @returns {Promise<Object>} Order details
 */
const getOrderByTrackingToken = async (trackingToken) => {
  const order = await prisma.order.findUnique({
    where: { trackingToken },
    include: {
      items: {
        include: {
          variant: { include: { product: true } }
        }
      },
      shipments: true,
      orderAddress: true,
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

// ======================== ORDER STATUS MANAGEMENT ========================

const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error('Order not found');
  }

  // Validate status transitions
  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  // Cannot uncancel or change cancelled order
  if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
    throw new Error('Cannot change status of a cancelled order');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: true,
      items: true,
      payments: true,
      shipments: true,
    }
  });

  return {
    message: `Order status updated to ${status}`,
    order: updatedOrder
  };
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error('Order not found');
  }

  const validStatuses = ['PENDING', 'SUCCESS', 'FAILED'];
  if (!validStatuses.includes(paymentStatus)) {
    throw new Error(`Invalid payment status. Allowed: ${validStatuses.join(', ')}`);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
    include: {
      user: true,
      items: true,
      payments: true,
      shipments: true,
    }
  });

  return {
    message: `Payment status updated to ${paymentStatus}`,
    order: updatedOrder
  };
};

// ======================== SHIPMENT MANAGEMENT ========================

const createOrUpdateShipment = async (orderId, shipmentData) => {
  const { courierName, trackingNumber, trackingUrl, status } = shipmentData;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error('Order not found');
  }

  const existingShipment = await prisma.orderShipment.findFirst({
    where: { orderId }
  });

  let shipment;

  if (existingShipment) {
    shipment = await prisma.orderShipment.update({
      where: { id: existingShipment.id },
      data: {
        ...(courierName && { courierName }),
        ...(trackingNumber && { trackingNumber }),
        ...(trackingUrl && { trackingUrl }),
        ...(status && { status }),
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
      }
    });
  } else {
    shipment = await prisma.orderShipment.create({
      data: {
        orderId,
        courierName: courierName || null,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        status: status || 'PENDING',
        shippedAt: status === 'SHIPPED' ? new Date() : null,
      }
    });
  }

  return {
    message: 'Shipment updated successfully',
    shipment
  };
};

const getOrderShipment = async (orderId) => {
  const shipment = await prisma.orderShipment.findFirst({
    where: { orderId }
  });

  if (!shipment) {
    throw new Error('Shipment not found for this order');
  }

  return shipment;
};

// ======================== ORDER ANALYTICS ========================

const getOrderAnalytics = async (filters = {}) => {
  const { startDate, endDate } = filters;

  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [totalOrders, totalRevenue, statusBreakdown, paymentBreakdown] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where: { ...where, paymentStatus: 'SUCCESS' },
      _sum: { totalAmount: true }
    }),
    prisma.order.groupBy({
      by: ['status'],
      where,
      _count: true
    }),
    prisma.order.groupBy({
      by: ['paymentStatus'],
      where,
      _count: true
    })
  ]);

  // Get top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productName'],
    where: { order: where },
    _sum: { quantity: true, subtotal: true },
    _count: true,
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    statusBreakdown: statusBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    paymentBreakdown: paymentBreakdown.reduce((acc, item) => {
      acc[item.paymentStatus] = item._count;
      return acc;
    }, {}),
    topProducts
  };
};

// ======================== ORDER CANCELLATION ========================

const cancelOrder = async (orderId, reason = '') => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'DELIVERED') {
    throw new Error('Cannot cancel a delivered order');
  }

  if (order.status === 'CANCELLED') {
    throw new Error('Order is already cancelled');
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'CANCELLED',
      paymentStatus: 'FAILED' // Mark payment as failed on cancellation
    },
    include: {
      user: true,
      items: true,
      payments: true,
      shipments: true,
    }
  });

  // Release inventory for all items
  for (const item of updatedOrder.items) {
    // Add a RELEASE log
    await prisma.inventoryLog.create({
      data: {
        variantId: item.variantId,
        type: 'RELEASE',
        quantity: item.quantity,
        orderId,
        note: `Order cancelled. ${reason}`
      }
    });
  }

  return {
    message: 'Order cancelled successfully',
    order: updatedOrder
  };
};

// ======================== ORDER ITEMS ========================

const getOrderItems = async (orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error('Order not found');
  }

  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      variant: { include: { product: true } }
    }
  });

  return items;
};
module.exports = {
  // Order CRUD
  getOrders,
  getOrderById,
  getOrderByTrackingToken,
  // Status Management
  updateOrderStatus, 
  updatePaymentStatus,
  // Shipment Management
  createOrUpdateShipment,
  getOrderShipment,
  // Analytics
  getOrderAnalytics,
  // Cancellation
  cancelOrder,
  // Order Items
  getOrderItems
};