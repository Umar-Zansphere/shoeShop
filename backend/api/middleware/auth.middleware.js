// auth.middleware.js

const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const { getOrCreateSession, generateSessionId } = require('../services/session.services');

const verifyToken = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. If not found, check for token in cookies
  else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 3. Fallback to checking the query parameter (optional, but you had it before)
  else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        is_active: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Attach complete user object with role information
    req.user = user;

    next();
  } catch (error) {
    // If the access token is expired, the client should use the refresh token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

/**
 * Optional authentication middleware - allows both authenticated and guest users
 * Attaches user if token is valid, otherwise continues without user
 */
const optionalAuth = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Fallback to query parameter
  else if (req.query.token) {
    token = req.query.token;
  }

  // If no token, continue as guest
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        is_active: true,
        role: true,
        email: true,
        phone: true,
        fullName: true,
      }
    });

    if (user) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch (error) {
    // Invalid or expired token - continue as guest
    req.user = null;
  }

  next();
};

/**
 * Generate and manage guest session ID
 * If no session ID provided, generates one and sets it in cookie
 * Attaches sessionId to request for later use
 */
const manageGuestSession = async (req, res, next) => {
  try {
    // If user is authenticated, skip guest session
    if (req.user && req.user.id) {
      req.sessionId = null;
      return next();
    }

    // Try to get session ID from header or cookie
    let sessionId = req.headers['x-session-id'] || req.cookies.guestSessionId;

    if (!sessionId) {
      // Generate new session ID
      sessionId = generateSessionId();
      
      // Create session in database
      const session = await getOrCreateSession(sessionId);
      
      // Set session ID in cookie (30 days expiry)
      res.cookie('guestSessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      req.sessionId = sessionId;
      req.guestSessionDbId = session.id; // Also attach the database session ID
      return next();
    }

    // Validate existing session exists in database
    const session = await getOrCreateSession(sessionId);
    req.sessionId = sessionId;
    req.guestSessionDbId = session.id;

    next();
  } catch (error) {
    console.error('Error in manageGuestSession:', error);
    next(error);
  }
};

/**
 * Extract session ID from request (header or cookie)
 * Now primarily used as fallback if manageGuestSession is not in middleware chain
 * @deprecated Use manageGuestSession instead
 */
const extractSession = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.cookies.guestSessionId;
  req.sessionId = sessionId || null;
  next();
};

/**
 * Require either authentication or valid session
 */
const requireAuthOrSession = async (req, res, next) => {
  // First try to authenticate
  await optionalAuth(req, res, () => { });

  // Extract session
  extractSession(req, res, () => { });

  // Check if we have either user or session
  if (!req.user && !req.sessionId) {
    return res.status(401).json({
      message: 'Unauthorized: Please login or provide a valid session',
      toast: {
        type: 'error',
        message: 'Please login or start a new session'
      }
    });
  }

  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  manageGuestSession,
  extractSession,
  requireAuthOrSession
};