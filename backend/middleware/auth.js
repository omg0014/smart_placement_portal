const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and attach user to request
const auth = async (req, res, next) => {
  try {
    // grab the token from "Authorization: Bearer <token>"
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, please login' });
    }

    const token = header.split(' ')[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find the user and attach to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
