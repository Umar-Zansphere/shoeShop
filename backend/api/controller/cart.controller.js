const cartService = require('../services/cart.services');

// ======================== CART CONTROLLERS ========================

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getActiveCart(userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const getCartSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summary = await cartService.getCartSummary(userId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    const qty = quantity ? parseInt(quantity) : 1;
    if (qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const result = await cartService.addToCart(userId, variantId, qty);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }

    if (!quantity) {
      return res.status(400).json({ message: 'Quantity is required' });
    }

    const result = await cartService.updateCartItem(userId, cartItemId, parseInt(quantity));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    if (!cartItemId) {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }

    const result = await cartService.removeFromCart(userId, cartItemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await cartService.clearCart(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== WISHLIST CONTROLLERS ========================

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wishlist = await cartService.getWishlist(userId);
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await cartService.addToWishlist(userId, productId, variantId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { wishlistItemId } = req.params;

    if (!wishlistItemId) {
      return res.status(400).json({ message: 'Wishlist item ID is required' });
    }

    const result = await cartService.removeFromWishlist(userId, wishlistItemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const moveToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { wishlistItemId } = req.params;

    if (!wishlistItemId) {
      return res.status(400).json({ message: 'Wishlist item ID is required' });
    }

    const result = await cartService.moveToCart(userId, wishlistItemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await cartService.clearWishlist(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Cart
  getCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist
};
