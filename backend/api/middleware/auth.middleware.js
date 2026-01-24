// auth.middleware.js

const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');

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

module.exports = { 
  verifyToken
};