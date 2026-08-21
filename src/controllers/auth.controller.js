const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json(req.user.toJSON());
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { token: currentToken } = req.body;
    let userId;

    if (currentToken) {
      try {
        const decoded = jwt.verify(
          currentToken,
          process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
          { ignoreExpiration: true }
        );
        userId = decoded.id;
      } catch (err) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Invalid token for refresh.',
        });
      }
    } else if (req.user) {
      userId = req.user._id;
    } else {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Token required for refresh.',
      });
    }

    const newToken = generateToken(userId);
    return res.status(200).json({ token: newToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
};
