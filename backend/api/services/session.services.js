const prisma = require('../../config/prisma');
const crypto = require('crypto');

// ======================== SESSION GENERATION ========================

/**
 * Generate a unique session ID
 * @returns {string} Unique session identifier
 */
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Get or create a guest session
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Session object
 */
const getOrCreateSession = async (sessionId) => {
  if (!sessionId) {
    // Create new session
    const newSessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await prisma.guestSession.create({
      data: {
        sessionId: newSessionId,
        expiresAt,
      },
    });

    return session;
  }

  // Find existing session
  let session = await prisma.guestSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    // Session doesn't exist, create new one
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    session = await prisma.guestSession.create({
      data: {
        sessionId,
        expiresAt,
      },
    });
  } else if (session.expiresAt < new Date()) {
    // Session expired, create new one
    const newSessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    session = await prisma.guestSession.create({
      data: {
        sessionId: newSessionId,
        expiresAt,
      },
    });
  }

  return session;
};

/**
 * Validate if a session exists and is not expired
 * @param {string} sessionId - Session identifier
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
const validateSession = async (sessionId) => {
  if (!sessionId) return false;

  const session = await prisma.guestSession.findUnique({
    where: { sessionId },
  });

  if (!session) return false;
  if (session.expiresAt < new Date()) return false;

  return true;
};

/**
 * Extend session expiry
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Updated session
 */
const extendSession = async (sessionId) => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return await prisma.guestSession.update({
    where: { sessionId },
    data: { expiresAt },
  });
};

// ======================== SESSION MIGRATION ========================

/**
 * Migrate guest session data to user account
 * @param {string} sessionId - Guest session identifier
 * @param {string} userId - User ID to migrate to
 * @returns {Promise<Object>} Migration result
 */
const migrateSessionToUser = async (sessionId, userId) => {
  const session = await prisma.guestSession.findUnique({
    where: { sessionId },
    include: {
      carts: { include: { items: true } },
      wishlists: { include: { items: true } },
    },
  });

  if (!session) {
    return { success: false, message: 'Session not found' };
  }

  const migrationResult = {
    cartsMigrated: 0,
    wishlistsMigrated: 0,
    itemsMigrated: 0,
  };

  // Migrate cart
  if (session.carts && session.carts.length > 0) {
    for (const guestCart of session.carts) {
      if (guestCart.status !== 'ACTIVE') continue;

      // Find or create user's active cart
      let userCart = await prisma.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId, status: 'ACTIVE' },
        });
      }

      // Migrate cart items
      for (const item of guestCart.items) {
        // Check if item already exists in user cart
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            variantId: item.variantId,
          },
        });

        if (existingItem) {
          // Update quantity
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          // Move item to user cart
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { cartId: userCart.id },
          });
        }

        migrationResult.itemsMigrated++;
      }

      // Delete guest cart
      await prisma.cart.delete({ where: { id: guestCart.id } });
      migrationResult.cartsMigrated++;
    }
  }

  // Migrate wishlist
  if (session.wishlists && session.wishlists.length > 0) {
    for (const guestWishlist of session.wishlists) {
      // Find or create user's wishlist
      let userWishlist = await prisma.wishlist.findFirst({
        where: { userId },
      });

      if (!userWishlist) {
        userWishlist = await prisma.wishlist.create({
          data: { userId },
        });
      }

      // Migrate wishlist items
      for (const item of guestWishlist.items) {
        // Check if item already exists in user wishlist
        const existingItem = await prisma.wishlistItem.findFirst({
          where: {
            wishlistId: userWishlist.id,
            productId: item.productId,
            variantId: item.variantId,
          },
        });

        if (!existingItem) {
          // Move item to user wishlist
          await prisma.wishlistItem.update({
            where: { id: item.id },
            data: { wishlistId: userWishlist.id },
          });
        } else {
          // Item already exists, delete duplicate
          await prisma.wishlistItem.delete({ where: { id: item.id } });
        }
      }

      // Delete guest wishlist
      await prisma.wishlist.delete({ where: { id: guestWishlist.id } });
      migrationResult.wishlistsMigrated++;
    }
  }

  // Delete the guest session
  await prisma.guestSession.delete({ where: { id: session.id } });

  return {
    success: true,
    message: 'Session migrated successfully',
    ...migrationResult,
  };
};

// ======================== SESSION CLEANUP ========================

/**
 * Clean up expired sessions and abandoned carts
 * @returns {Promise<Object>} Cleanup statistics
 */
const cleanupExpiredSessions = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Delete expired sessions
  const deletedSessions = await prisma.guestSession.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  // Delete abandoned carts (older than 30 days)
  const deletedCarts = await prisma.cart.deleteMany({
    where: {
      status: 'ABANDONED',
      updatedAt: { lt: thirtyDaysAgo },
    },
  });

  return {
    sessionsDeleted: deletedSessions.count,
    cartsDeleted: deletedCarts.count,
  };
};

module.exports = {
  generateSessionId,
  getOrCreateSession,
  validateSession,
  extendSession,
  migrateSessionToUser,
  cleanupExpiredSessions,
};
