// Helper function to make authenticated requests
const authenticatedFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Browser automatically sends cookies
    headers,
  });

  return response;
};

// ======================== PRODUCTS API ========================

export const productsApi = {
  // Get all products
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.search) params.append('search', filters.search);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.take) params.append('take', filters.take);

    const res = await authenticatedFetch(`/api/admin/products?${params}`);
    return res.json();
  },

  // Create product (supports FormData for multipart uploads)
  createProduct: async (productData) => {
    const isFormData = productData instanceof FormData;
    const options = {
      method: 'POST',
      credentials: 'include',
      body: productData,
    };

    // Only add headers if not FormData (let browser handle multipart)
    if (!isFormData) {
      options.headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };
    } else {
      options.headers = {
        'ngrok-skip-browser-warning': 'true',
      };
    }

    const res = await fetch(`/api/admin/products`, options);
    return res.json();
  },

  // Get product by ID
  getProductById: async (productId) => {
    const res = await authenticatedFetch(`/api/admin/products/${productId}`);
    return res.json();
  },

  // Update product
  updateProduct: async (productId, productData) => {
    const res = await authenticatedFetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  // Delete product
  deleteProduct: async (productId) => {
    const res = await authenticatedFetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ======================== VARIANTS ========================

  // Get product variants
  getVariants: async (productId) => {
    const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`);
    return res.json();
  },

  // Create variant
  createVariant: async (productId, variantData) => {
    const res = await authenticatedFetch(`/api/admin/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantData),
    });
    return res.json();
  },

  // Update variant
  updateVariant: async (variantId, variantData) => {
    const res = await authenticatedFetch(`/api/admin/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(variantData),
    });
    return res.json();
  },

  // Delete variant
  deleteVariant: async (variantId) => {
    const res = await authenticatedFetch(`/api/admin/variants/${variantId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ======================== IMAGES ========================

  // Get variant images
  getImages: async (variantId) => {
    const res = await authenticatedFetch(`/api/admin/variants/${variantId}/images`);
    return res.json();
  },

  // Upload image to variant
  addImage: async (variantId, formData) => {
    const res = await fetch(`/api/admin/variants/${variantId}/images`, {
      method: 'POST',
      credentials: 'include', // Browser automatically sends cookies
      body: formData,
    });
    return res.json();
  },

  // Update image
  updateImage: async (imageId, imageData) => {
    const res = await authenticatedFetch(`/api/admin/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(imageData),
    });
    return res.json();
  },

  // Delete image
  deleteImage: async (imageId) => {
    const res = await authenticatedFetch(`/api/admin/images/${imageId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // ======================== INVENTORY ========================

  // Get inventory
  getInventory: async (variantId) => {
    const res = await authenticatedFetch(`/api/admin/variants/${variantId}/inventory`);
    return res.json();
  },

  // Update inventory
  updateInventory: async (variantId, quantity) => {
    const res = await authenticatedFetch(`/api/admin/variants/${variantId}/inventory`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  // Get inventory logs
  getInventoryLogs: async (variantId, skip = 0, take = 10) => {
    const res = await authenticatedFetch(
      `/api/admin/variants/${variantId}/inventory-logs?skip=${skip}&take=${take}`
    );
    return res.json();
  },

  // Add inventory log
  addInventoryLog: async (variantId, logData) => {
    const res = await authenticatedFetch(
      `/api/admin/variants/${variantId}/inventory-logs`,
      {
        method: 'POST',
        body: JSON.stringify(logData),
      }
    );
    return res.json();
  },
};

// ======================== ORDERS API ========================

export const ordersApi = {
  // Get all orders
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.take) params.append('take', filters.take);

    const res = await authenticatedFetch(`/api/admin/orders?${params}`);
    return res.json();
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}`);
    return res.json();
  },

  // Get order items
  getOrderItems: async (orderId) => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}/items`);
    return res.json();
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus) => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}/payment-status`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus }),
    });
    return res.json();
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  // ======================== SHIPMENTS ========================

  // Get shipment
  getShipment: async (orderId) => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}/shipment`);
    return res.json();
  },

  // Create/Update shipment
  createOrUpdateShipment: async (orderId, shipmentData) => {
    const res = await authenticatedFetch(`/api/admin/orders/${orderId}/shipment`, {
      method: 'PUT',
      body: JSON.stringify(shipmentData),
    });
    return res.json();
  },

  // ======================== ANALYTICS ========================

  // Get order analytics
  getAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await authenticatedFetch(`/api/admin/analytics/orders?${params}`);
    return res.json();
  },
};
