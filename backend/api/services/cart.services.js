const prisma = require('../../config/prisma');

// ======================== CART MANAGEMENT ========================

const getActiveCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              gender: true
            }
          },
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              price: true,
              compareAtPrice: true,
              isAvailable: true,
              inventory: true,
              images: {
                where: { isPrimary: true },
                select: { url: true, altText: true }
              }
            }
          }
        }
      }
    }
  });

  // Create cart if doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        items: {
          include: {
            product: true,
            variant: {
              include: {
                inventory: true,
                images: { where: { isPrimary: true } }
              }
            }
          }
        }
      }
    });
  }

  return cart;
};

const addToCart = async (userId, variantId, quantity = 1) => {
  // Validate variant exists and is available
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true, inventory: true }
  });

  if (!variant) {
    throw new Error('Variant not found');
  }

  if (!variant.isAvailable) {
    throw new Error('Variant is not available');
  }

  // Check inventory
  if (!variant.inventory || variant.inventory.quantity < quantity) {
    throw new Error('Insufficient inventory');
  }

  // Get or create active cart
  let cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, status: 'ACTIVE' }
    });
  }

  // Check if item already in cart
  let cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      variantId,
      productId: variant.productId
    }
  });

  if (cartItem) {
    // Update quantity
    const newQuantity = cartItem.quantity + quantity;
    if (variant.inventory.quantity < newQuantity) {
      throw new Error('Insufficient inventory for this quantity');
    }

    cartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: newQuantity },
      include: {
        product: true,
        variant: {
          include: {
            inventory: true,
            images: { where: { isPrimary: true } }
          }
        }
      }
    });
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: variant.productId,
        variantId,
        quantity,
        unitPrice: variant.price
      },
      include: {
        product: true,
        variant: {
          include: {
            inventory: true,
            images: { where: { isPrimary: true } }
          }
        }
      }
    });
  }

  return {
    message: quantity > 1 ? `Updated quantity to ${cartItem.quantity}` : 'Added to cart',
    cartItem
  };
};

const updateCartItem = async (userId, cartItemId, quantity) => {
  // Verify item belongs to user's cart
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: { userId }
    },
    include: { variant: { include: { inventory: true } } }
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Check inventory
  if (cartItem.variant.inventory.quantity < quantity) {
    throw new Error('Insufficient inventory');
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: {
      product: true,
      variant: {
        include: {
          inventory: true,
          images: { where: { isPrimary: true } }
        }
      }
    }
  });

  return {
    message: 'Cart item updated',
    cartItem: updatedItem
  };
};

const removeFromCart = async (userId, cartItemId) => {
  // Verify item belongs to user's cart
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: { userId }
    }
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });

  return { message: 'Item removed from cart' };
};

const clearCart = async (userId) => {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' }
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  return { message: 'Cart cleared' };
};

const getCartSummary = async (userId) => {
  const cart = await getActiveCart(userId);

  let subtotal = 0;
  const items = cart.items.map(item => {
    const itemTotal = parseFloat(item.variant.price) * item.quantity;
    subtotal += itemTotal;

    return {
      id: item.id,
      product: item.product,
      variant: item.variant,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotal: itemTotal
    };
  });

  return {
    cartId: cart.id,
    items,
    itemCount: items.length,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat((subtotal * 0.18).toFixed(2)), // Assuming 18% tax
    total: parseFloat((subtotal + subtotal * 0.18).toFixed(2)),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
};

// ======================== WISHLIST MANAGEMENT ========================

const getWishlist = async (userId) => {
  let wishlist = await prisma.wishlist.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              category: true,
              gender: true,
              isActive: true,
              isFeatured: true
            }
          },
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              price: true,
              compareAtPrice: true,
              isAvailable: true,
              images: {
                where: { isPrimary: true },
                select: { url: true, altText: true }
              }
            }
          }
        }
      }
    }
  });

  // Create wishlist if doesn't exist
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: { items: { include: { product: true, variant: true } } }
    });
  }

  return wishlist;
};

const addToWishlist = async (userId, productId, variantId = null) => {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // If variantId provided, validate it
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!variant || variant.productId !== productId) {
      throw new Error('Variant not found or does not belong to this product');
    }
  }

  // Get or create wishlist
  let wishlist = await prisma.wishlist.findFirst({
    where: { userId }
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId }
    });
  }

  // Check if item already in wishlist
  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
      variantId: variantId || null
    }
  });

  if (existingItem) {
    throw new Error('Item already in wishlist');
  }

  const wishlistItem = await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
      variantId: variantId || null
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          category: true,
          gender: true
        }
      },
      variant: {
        select: {
          id: true,
          size: true,
          color: true,
          price: true,
          compareAtPrice: true,
          isAvailable: true,
          images: { where: { isPrimary: true } }
        }
      }
    }
  });

  return {
    message: 'Added to wishlist',
    wishlistItem
  };
};

const removeFromWishlist = async (userId, wishlistItemId) => {
  // Verify item belongs to user's wishlist
  const wishlistItem = await prisma.wishlistItem.findFirst({
    where: {
      id: wishlistItemId,
      wishlist: { userId }
    }
  });

  if (!wishlistItem) {
    throw new Error('Wishlist item not found');
  }

  await prisma.wishlistItem.delete({
    where: { id: wishlistItemId }
  });

  return { message: 'Item removed from wishlist' };
};

const moveToCart = async (userId, wishlistItemId) => {
  // Get wishlist item
  const wishlistItem = await prisma.wishlistItem.findFirst({
    where: {
      id: wishlistItemId,
      wishlist: { userId }
    },
    include: { variant: true }
  });

  if (!wishlistItem) {
    throw new Error('Wishlist item not found');
  }

  if (!wishlistItem.variantId) {
    throw new Error('Please select a variant to add to cart');
  }

  // Add to cart
  const result = await addToCart(userId, wishlistItem.variantId, 1);

  // Remove from wishlist
  await prisma.wishlistItem.delete({
    where: { id: wishlistItemId }
  });

  return {
    message: 'Moved to cart',
    cartItem: result.cartItem
  };
};

const clearWishlist = async (userId) => {
  const wishlist = await prisma.wishlist.findFirst({
    where: { userId }
  });

  if (!wishlist) {
    throw new Error('Wishlist not found');
  }

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id }
  });

  return { message: 'Wishlist cleared' };
};

module.exports = {
  // Cart
  getActiveCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist
};
