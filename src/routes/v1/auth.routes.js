const express = require('express');
const {
  register,
  login,
  getMe,
  refreshToken,
} = require('../../controllers/auth.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  registerRules,
  loginRules,
} = require('../../validators/auth.validator');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

module.exports = router;
