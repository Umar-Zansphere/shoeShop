import { getSessionId } from './sessionManager';

const makeRequest = async (url, options = {}) => {
  const sessionId = getSessionId();

  const response = await fetch(`${url}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      ...(sessionId ? { 'x-session-id': sessionId } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const authApi = {
  // Phone Auth
  phoneLogin: (phoneNumber) =>
    fetch(`/api/auth/phone-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', },
      body: JSON.stringify({ phoneNumber }),
    }),

  phoneLoginVerify: (phoneNumber, otp) =>
    fetch(`/api/auth/phone-login-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phoneNumber, otp }),
    }),

  phoneSignup: (phoneNumber) =>
    fetch(`/api/auth/phone-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phoneNumber }),
    }),

  phoneSignupVerify: (phoneNumber, otp) =>
    fetch(`/api/auth/phone-signup-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phoneNumber, otp }),
    }),

  // Email Auth
  login: (email, password) =>
    fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email, password }),
    }),

  signup: (email, password) =>
    fetch(`/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (token) =>
    fetch(`/api/auth/verify-email`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      params: { token },
    }),

  logout: () =>
    fetch(`/api/auth/logout`, {
      method: 'POST',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'include',
    }),

  forgotPassword: (email) =>
    fetch(`/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email }),
    }),
};

// Product API - Customer facing endpoints
export const productApi = {
  // Get filter options
  getFilterOptions: () => makeRequest('/api/products/filters/options'),

  // Get popular/featured products
  getPopularProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/popular${query ? '?' + query : ''}`);
  },

  // Get products by brand
  getProductsByBrand: (brandName, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/brand/${encodeURIComponent(brandName)}${query ? '?' + query : ''}`);
  },

  // Get products by category
  getProductsByCategory: (categoryName, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/category/${encodeURIComponent(categoryName)}${query ? '?' + query : ''}`);
  },

  // Get products by gender
  getProductsByGender: (genderName, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/gender/${encodeURIComponent(genderName)}${query ? '?' + query : ''}`);
  },

  // Get products by color
  getProductsByColor: (colorName, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/color/${encodeURIComponent(colorName)}${query ? '?' + query : ''}`);
  },

  // Get products by size
  getProductsBySize: (sizeValue, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/size/${encodeURIComponent(sizeValue)}${query ? '?' + query : ''}`);
  },

  // Get products by model number
  getProductsByModel: (modelNumber, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products/model/${encodeURIComponent(modelNumber)}${query ? '?' + query : ''}`);
  },

  // Search products with advanced filters
  searchProducts: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return makeRequest(`/api/products/search${query ? '?' + query : ''}`);
  },

  // Get products list with optional filters
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/api/products${query ? '?' + query : ''}`);
  },

  // Get single product detail
  getProductDetail: (productId) => {
    return makeRequest(`/api/products/${productId}`);
  },
};

// Cart API
export const cartApi = {
  getCart: () => makeRequest('/api/cart'),

  addToCart: (variantId, quantity = 1) =>
    makeRequest('/api/cart', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ variantId, quantity }),
    }),

  removeFromCart: (cartItemId) =>
    makeRequest(`/api/cart/${cartItemId}`, {
      method: 'DELETE',
      credentials: 'include',
    }),

  updateCartItem: (cartItemId, quantity) =>
    makeRequest(`/api/cart/${cartItemId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({ quantity }),

    }),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => makeRequest('/api/wishlist'),

  addToWishlist: (productId, variantId = null) =>
    makeRequest('/api/wishlist', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ productId, variantId }),
    }),

  removeFromWishlist: (wishlistItemId) =>
    makeRequest(`/api/wishlist/${wishlistItemId}`, {
      method: 'DELETE',
      credentials: 'include',
    }),

  moveToCart: (wishlistItemId) =>
    makeRequest(`/api/wishlist/${wishlistItemId}/move-to-cart`, {
      method: 'POST',
      credentials: 'include',
    }),
};

// LocalStorage API - for non-logged-in users
export const storageApi = {
  // Cart storage
  getCart: () => {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  addToCart: (item) => {
    if (typeof window === 'undefined') return;
    const cart = storageApi.getCart();
    const existingItem = cart.find(i => i.variantId === item.variantId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  removeFromCart: (itemId) => {
    if (typeof window === 'undefined') return;
    const cart = storageApi.getCart();
    const filtered = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(filtered));
  },

  updateCartItem: (itemId, quantity) => {
    if (typeof window === 'undefined') return;
    const cart = storageApi.getCart();
    const item = cart.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  },

  clearCart: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('cart');
  },

  // Wishlist storage
  getWishlist: () => {
    if (typeof window === 'undefined') return [];
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  },

  addToWishlist: (item) => {
    if (typeof window === 'undefined') return;
    const wishlist = storageApi.getWishlist();
    const exists = wishlist.find(w => w.productId === item.productId && w.variantId === item.variantId);
    if (!exists) {
      wishlist.push(item);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  },

  removeFromWishlist: (itemId) => {
    if (typeof window === 'undefined') return;
    const wishlist = storageApi.getWishlist();
    // Remove by both id and variantId to handle different ID formats
    const filtered = wishlist.filter(item => item.id !== itemId && !itemId.includes(item.variantId));
    localStorage.setItem('wishlist', JSON.stringify(filtered));
  },

  clearWishlist: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('wishlist');
  },
};

// Migration API - move localStorage data to database after login
export const migrationApi = {
  migrateCart: async () => {
    try {
      const cart = storageApi.getCart();
      console.log('Migrating cart:', cart);
      if (cart.length === 0) {
        console.log('No cart items to migrate');
        return;
      }

      // Add each item to database cart
      for (const item of cart) {
        await cartApi.addToCart(item.variantId, item.quantity);
      }

      // Clear localStorage cart
      storageApi.clearCart();
      console.log('Successfully migrated cart to database');
    } catch (err) {
      console.error('Error migrating cart:', err);
      // Keep localStorage cart intact if migration fails
    }
  },

  migrateWishlist: async () => {
    try {
      const wishlist = storageApi.getWishlist();
      console.log('Migrating wishlist:', wishlist);
      if (wishlist.length === 0) {
        console.log('No wishlist items to migrate');
        return;
      }

      // Add each item to database wishlist
      for (const item of wishlist) {
        console.log('Adding to database wishlist:', item);
        await wishlistApi.addToWishlist(item.productId, item.variantId || null);
      }

      // Clear localStorage wishlist
      storageApi.clearWishlist();
      console.log('Successfully migrated wishlist to database');
    } catch (err) {
      console.error('Error migrating wishlist:', err);
      // Keep localStorage wishlist intact if migration fails
    }
  },

  // Migrate both cart and wishlist
  migrateAll: async () => {
    console.log('Starting migration of localStorage data to database');
    await migrationApi.migrateCart();
    await migrationApi.migrateWishlist();
    console.log('Migration completed');
  },
};

// Order API - Customer-facing order endpoints
export const orderApi = {
  // Create order from cart (checkout)
  createOrder: async (addressId, paymentMethod) => {
    return makeRequest('/api/orders', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ addressId, paymentMethod })
    });
  },

  // Create guest order with address data
  createGuestOrder: async (addressData, paymentMethod) => {
    return makeRequest('/api/orders/guest', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ address: addressData, paymentMethod })
    });
  },

  // Get all orders for user
  getOrders: async (status = null, skip = 0, take = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('skip', skip);
    params.append('take', take);

    return makeRequest(`/api/orders?${params.toString()}`, {
      credentials: 'include',
    });
  },

  // Get order detail
  getOrderDetail: async (orderId) => {
    return makeRequest(`/api/orders/${orderId}`, {
      credentials: 'include',
    });
  },

  // Track order
  trackOrder: async (orderId) => {
    return makeRequest(`/api/orders/${orderId}/track`, {
      credentials: 'include',
    });
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    return makeRequest(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ reason })
    });
  }
};

// User API - Profile and account management
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return makeRequest('/api/users/profile', {
      credentials: 'include',
    });
  },

  // Update profile (fullName, email)
  updateProfile: async (fullName, email) => {
    return makeRequest('/api/users/profile', {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ fullName, email })
    });
  },

  // Update phone number
  updatePhoneNumber: async (phoneNumber) => {
    return makeRequest('/api/users/phone', {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ phoneNumber })
    });
  }
};

// Address API - Delivery address management
export const addressApi = {
  // Get all addresses
  getAddresses: async () => {
    return makeRequest('/api/users/addresses', {
      credentials: 'include',
    });
  },

  // Get single address
  getAddressById: async (addressId) => {
    return makeRequest(`/api/users/addresses/${addressId}`, {
      credentials: 'include',
    });
  },

  // Create address
  createAddress: async (addressData) => {
    return makeRequest('/api/users/addresses', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(addressData)
    });
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    return makeRequest(`/api/users/addresses/${addressId}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(addressData)
    });
  },

  // Delete address
  deleteAddress: async (addressId) => {
    return makeRequest(`/api/users/addresses/${addressId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    return makeRequest(`/api/users/addresses/${addressId}/default`, {
      method: 'PATCH',
      credentials: 'include'
    });
  }
};

// Payment API
export const paymentApi = {
  // Verify Razorpay payment
  verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    return makeRequest('/api/orders/payment/verify', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      })
    });
  }
};