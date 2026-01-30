const prisma = require('../../config/prisma');
const razorpayService = require('./razorpay.services');

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

// ======================== CUSTOMER-FACING ORDER ENDPOINTS ========================

const createOrderFromCart = async (userId, orderData) => {
  const { addressId, paymentMethod, couponCode } = orderData;

  // Validate required fields
  if (!addressId || !paymentMethod) {
    throw new Error('Address ID and payment method are required');
  }

  // Get user's active cart
  const cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: { include: { variant: { include: { product: true } } } } }
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Get address
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new Error('Address not found or unauthorized');
  }

  // Get user details
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Calculate total
  const totalAmount = cart.items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order with transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        totalAmount: parseFloat(totalAmount),
        items: {
          create: cart.items.map(item => ({
            variantId: item.variantId,
            productName: item.variant.product.name,
            color: item.variant.color,
            size: item.variant.size,
            price: item.unitPrice,
            quantity: item.quantity,
            subtotal: parseFloat(item.unitPrice) * item.quantity
          }))
        }
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        payments: true,
        shipments: true
      }
    });

    // Create order address
    await tx.orderAddress.create({
      data: {
        orderId: newOrder.id,
        name: address.name,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      }
    });

    // Create initial shipment
    await tx.orderShipment.create({
      data: {
        orderId: newOrder.id,
        status: 'PENDING'
      }
    });

    // Mark inventory as HOLD
    for (const item of cart.items) {
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          orderId: newOrder.id,
          type: 'HOLD',
          quantity: item.quantity,
          note: 'Order created, awaiting payment'
        }
      });
    }

    // Update cart status
    // await tx.cart.update({
    //   where: { id: cart.id },
    //   data: { status: 'ORDERED' }
    // });

    return newOrder;
  });

  // If Razorpay, create Razorpay order
  let razorpayOrderDetails = null;
  if (paymentMethod === 'RAZORPAY') {
    try {
      razorpayOrderDetails = await razorpayService.createRazorpayOrder({
        orderId: order.id,
        amount: totalAmount,
        customerEmail: user.email,
        customerPhone: user.phone,
        customerName: user.fullName,
      });

      // Update order with Razorpay order ID
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrderDetails.razorpayOrderId }
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(`Failed to initialize payment: ${error.message}`);
    }
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    items: order.items,
    // Return Razorpay details if applicable
    ...(razorpayOrderDetails && {
      razorpayOrderId: razorpayOrderDetails.razorpayOrderId,
      razorpayAmount: razorpayOrderDetails.amount,
      razorpayCurrency: razorpayOrderDetails.currency,
    })
  };
};

const getCustomerOrders = async (userId, filters = {}) => {
  const { status, skip = 0, take = 10 } = filters;

  const where = { userId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { variant: { include: { product: true } } } },
        shipments: true,
        payments: true
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders: orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      shipmentStatus: order.shipments[0]?.status || 'PENDING'
    })),
    pagination: {
      total,
      skip: parseInt(skip),
      take: parseInt(take),
      pages: Math.ceil(total / take)
    }
  };
};

const getCustomerOrderDetail = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      shipments: true,
      payments: true
    }
  });

  if (!order || order.userId !== userId) {
    throw new Error('Order not found or unauthorized');
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    items: order.items.map(item => ({
      id: item.id,
      productName: item.productName,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      productImage: item.variant?.product?.variants?.[0]?.images?.[0]?.url
    })),
    shipment: order.shipments[0] ? {
      status: order.shipments[0].status,
      courierName: order.shipments[0].courierName,
      trackingNumber: order.shipments[0].trackingNumber,
      trackingUrl: order.shipments[0].trackingUrl,
      shippedAt: order.shipments[0].shippedAt
    } : null,
    payments: order.payments.map(p => ({
      gateway: p.gateway,
      status: p.status,
      amount: p.amount,
      paidAt: p.paidAt
    }))
  };
};

const trackOrder = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shipments: true
    }
  });

  if (!order || order.userId !== userId) {
    throw new Error('Order not found or unauthorized');
  }

  const shipment = order.shipments[0];

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    shipmentStatus: shipment?.status || 'PENDING',
    shipmentDetails: shipment ? {
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      trackingUrl: shipment.trackingUrl,
      shippedAt: shipment.shippedAt,
      estimatedDelivery: shipment.shippedAt ? new Date(new Date(shipment.shippedAt).getTime() + 5 * 24 * 60 * 60 * 1000) : null
    } : null,
    itemCount: order.items.length,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt
  };
};

const cancelCustomerOrder = async (userId, orderId, reason = '') => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order || order.userId !== userId) {
    throw new Error('Order not found or unauthorized');
  }

  if (order.status === 'DELIVERED') {
    throw new Error('Cannot cancel a delivered order. Contact support for return/refund.');
  }

  if (order.status === 'CANCELLED') {
    throw new Error('Order is already cancelled');
  }

  if (order.status === 'SHIPPED') {
    throw new Error('Cannot cancel a shipped order. Contact support for return/refund.');
  }

  // Cancel the order
  const cancelledOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED'
      },
      include: { items: true }
    });

    // Release inventory holds
    for (const item of updated.items) {
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          orderId,
          type: 'RELEASE',
          quantity: item.quantity,
          note: `Order cancelled by customer. ${reason}`
        }
      });
    }

    return updated;
  });

  return {
    message: 'Order cancelled successfully',
    orderId: cancelledOrder.id,
    orderNumber: cancelledOrder.orderNumber,
    status: cancelledOrder.status
  };
};

module.exports = {
  // Order CRUD (Admin)
  getOrders,
  getOrderById,
  // Status Management (Admin)
  updateOrderStatus,
  updatePaymentStatus,
  // Shipment Management (Admin)
  createOrUpdateShipment,
  getOrderShipment,
  // Analytics (Admin)
  getOrderAnalytics,
  // Cancellation
  cancelOrder,
  // Items
  getOrderItems,
  // Customer-facing endpoints
  createOrderFromCart,
  getCustomerOrders,
  getCustomerOrderDetail,
  trackOrder,
  cancelCustomerOrder
};
