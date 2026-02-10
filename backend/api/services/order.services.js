const prisma = require('../../config/prisma');
const razorpayService = require('./razorpay.services');
const { sendEmail } = require('../../config/email');
const { generateTokens } = require('../services/auth.services');
const notificationService = require('./notification.service');

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

  // Get order address for email
  const orderAddress = await prisma.orderAddress.findFirst({
    where: { orderId: order.id }
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

  // Send order confirmation email
  try {
    await sendEmail(
      user.email,
      'Order Confirmation - ' + order.orderNumber,
      'order-confirmation',
      {
        customerName: user.fullName,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productName: item.productName,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        addressLine1: orderAddress?.addressLine1 || '',
        addressLine2: orderAddress?.addressLine2 || '',
        city: orderAddress?.city || '',
        state: orderAddress?.state || '',
        postalCode: orderAddress?.postalCode || '',
        country: orderAddress?.country || '',
        phone: orderAddress?.phone || user.phone || '',
        trackingUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order.id}`
      }
    );
  } catch (emailError) {
    console.error('Error sending order confirmation email:', emailError);
    // Don't throw error - order creation should succeed even if email fails
  }

  // Notify admins about new order
  try {
    await notificationService.notifyNewOrder(order.id, {
      orderNumber: order.orderNumber,
      customerName: user.fullName,
      total: order.totalAmount
    });
  } catch (notificationError) {
    console.error('Error sending admin notification:', notificationError);
    // Don't throw error - order creation should succeed even if notification fails
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
    }),
    // For COD, indicate payment to be collected on delivery
    ...(paymentMethod === 'COD' && {
      message: 'Order created successfully. Payment to be collected on delivery.'
    })
  };
};

/**
 * Create order from cart for guest users
 * Flow: Create guest user → Create address → Create order
 */
const createOrderFromCartAsGuest = async (sessionId, orderData) => {
  const crypto = require('crypto');
  const { address, paymentMethod } = orderData;

  // Validate required fields
  if (!address || !paymentMethod) {
    throw new Error('Address and payment method are required');
  }

  if (!address.email || !address.phone) {
    throw new Error('Email and phone are required in address');
  }

  // Get guest session
  const session = await prisma.guestSession.findUnique({
    where: { sessionId }
  });

  if (!session) {
    throw new Error('Invalid session ID');
  }

  // Get guest's cart
  const cart = await prisma.cart.findFirst({
    where: { sessionId: session.id, status: 'ACTIVE' },
    include: { items: { include: { variant: { include: { product: true } } } } }
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Create guest user and order in a transaction
  const order = await prisma.$transaction(async (tx) => {

    // 3. Calculate total
    const totalAmount = cart.items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

    // 4. Generate order number and tracking token
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const trackingToken = crypto.randomBytes(16).toString('hex');

    // 5. Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        trackingToken,
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

    // 6. Create order address
    await tx.orderAddress.create({
      data: {
        orderId: newOrder.id,
        name: address.name,
        phone: address.phone,
        email: address.email,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || null,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      }
    });

    // 7. Create initial shipment
    await tx.orderShipment.create({
      data: {
        orderId: newOrder.id,
        status: 'PENDING'
      }
    });

    // 8. Mark inventory as HOLD
    for (const item of cart.items) {
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          orderId: newOrder.id,
          type: 'HOLD',
          quantity: item.quantity,
          note: 'Guest order created, awaiting payment'
        }
      });
    }

    return newOrder;
  });

  // Get order address for email
  const orderAddress = await prisma.orderAddress.findFirst({
    where: { orderId: order.id }
  });

  // If Razorpay, create Razorpay order
  let razorpayOrderDetails = null;
  if (paymentMethod === 'RAZORPAY') {
    try {
      razorpayOrderDetails = await razorpayService.createRazorpayOrder({
        orderId: order.id,
        amount: order.totalAmount,
        customerEmail: address.email,
        customerPhone: address.phone,
        customerName: address.name,
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

  // Send order confirmation email
  try {
    await sendEmail(
      address.email,
      'Order Confirmation - ' + order.orderNumber,
      'order-confirmation',
      {
        customerName: address.name,
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingToken: order.trackingToken,
        status: order.status,
        paymentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productName: item.productName,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        addressLine1: orderAddress?.addressLine1 || '',
        addressLine2: orderAddress?.addressLine2 || '',
        city: orderAddress?.city || '',
        state: orderAddress?.state || '',
        postalCode: orderAddress?.postalCode || '',
        country: orderAddress?.country || '',
        phone: orderAddress?.phone || address.phone || '',
        trackingUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/track-order/${order.trackingToken}`
      }
    );
  } catch (emailError) {
    console.error('Error sending order confirmation email:', emailError);
    // Don't throw error - order creation should succeed even if email fails  
  }

  // Notify admins about new guest order
  try {
    await notificationService.notifyNewOrder(order.id, {
      orderNumber: order.orderNumber,
      customerName: address.name,
      total: order.totalAmount
    });
  } catch (notificationError) {
    console.error('Error sending admin notification:', notificationError);
    // Don't throw error - order creation should succeed even if notification fails
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
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
    }),
    // For COD, indicate payment to be collected on delivery
    ...(paymentMethod === 'COD' && {
      message: 'Order created successfully. Payment to be collected on delivery.'
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

// ======================== GUEST ORDER ENDPOINTS ========================

const createGuestOrder = async (sessionId, addressData, paymentMethod) => {
  const { name, phone, email, addressLine1, addressLine2, city, state, postalCode, country } = addressData;

  // Validate required fields
  if (!name || !phone || !email || !addressLine1 || !city || !state || !postalCode || !country || !paymentMethod) {
    throw new Error('All address fields (including email) and payment method are required');
  }

  // Get guest session first
  const session = await prisma.guestSession.findUnique({
    where: { sessionId }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Then get the session's associated cart with items
  const sessionCart = await prisma.cart.findFirst({
    where: { sessionId: session.id },
    include: { items: { include: { variant: { include: { product: true } } } } }
  });

  if (!sessionCart || sessionCart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const cart = sessionCart;

  // Calculate total
  const totalAmount = cart.items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create guest order with transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order (guest order - no userId)
    const newOrder = await tx.order.create({
      data: {
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
        name,
        phone,
        email,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country
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
          note: 'Guest order created, awaiting payment'
        }
      });
    }

    return newOrder;
  });

  // If Razorpay, create Razorpay order
  let razorpayOrderDetails = null;
  if (paymentMethod === 'RAZORPAY') {
    try {
      razorpayOrderDetails = await razorpayService.createRazorpayOrder({
        orderId: order.id,
        amount: totalAmount,
        customerEmail: email,
        customerPhone: phone,
        customerName: name,
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

  // Get order address for email
  const orderAddress = await prisma.orderAddress.findFirst({
    where: { orderId: order.id }
  });

  // Send order confirmation email
  try {
    await sendEmail(
      email,
      'Order Confirmation - ' + order.orderNumber,
      'order-confirmation',
      {
        customerName: name,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productName: item.productName,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        addressLine1: orderAddress?.addressLine1 || '',
        addressLine2: orderAddress?.addressLine2 || '',
        city: orderAddress?.city || '',
        state: orderAddress?.state || '',
        postalCode: orderAddress?.postalCode || '',
        country: orderAddress?.country || '',
        phone: orderAddress?.phone || phone || '',
        trackingUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order.id}`
      }
    );
  } catch (emailError) {
    console.error('Error sending order confirmation email:', emailError);
    // Don't throw error - order creation should succeed even if email fails
  }

  // Notify admins about new guest order
  try {
    await notificationService.notifyNewOrder(order.id, {
      orderNumber: order.orderNumber,
      customerName: name,
      total: order.totalAmount
    });
  } catch (notificationError) {
    console.error('Error sending admin notification:', notificationError);
    // Don't throw error - order creation should succeed even if notification fails
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
    }),
    // For COD, indicate payment to be collected on delivery
    ...(paymentMethod === 'COD' && {
      message: 'Order created successfully. Payment to be collected on delivery.'
    })
  };
};

const getGuestOrderDetail = async (sessionId, orderId) => {
  // Verify the order belongs to this session
  const session = await prisma.guestSession.findUnique({
    where: { sessionId }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      shipments: true,
      payments: true,
      orderAddress: true
    }
  });

  if (!order || order.userId !== null) {
    // For guest orders, userId should be null
    throw new Error('Order not found');
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
    address: order.orderAddress,
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

const trackGuestOrder = async (sessionId, orderId) => {

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shipments: true
    }
  });

  if (!order || order.userId !== null) {
    throw new Error('Order not found');
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

module.exports = {
  getOrderByTrackingToken,
  // Cancellation
  cancelOrder,
  // Items
  getOrderItems,
  // Customer-facing endpoints
  createOrderFromCart,
  createOrderFromCartAsGuest,
  getCustomerOrders,
  getCustomerOrderDetail,
  trackOrder,
  cancelCustomerOrder,
  // Guest order endpoints
  createGuestOrder,
  getGuestOrderDetail,
  trackGuestOrder
};
