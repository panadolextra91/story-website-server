const jwt = require('jsonwebtoken');
const config = require('../config/app.config');

/**
 * Generate JWT token
 * @param {Object} payload - Data to be encoded in the token
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to be encoded in the token
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};
