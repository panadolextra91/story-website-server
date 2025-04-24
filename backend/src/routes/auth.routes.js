const express = require('express');
const { register, login, getMe, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', protect, getMe);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', refreshToken);

module.exports = router;
