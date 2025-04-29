const jwt = require('jsonwebtoken');
const {User} = require('../Models/user.model');

exports.authenticate = async (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    const token = req.cookies?.token || 
                 req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without user
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      return next(); // Invalid user
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    next(); // Continue even if token is invalid
  }
};

exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};