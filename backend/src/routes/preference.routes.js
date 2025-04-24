const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences
} = require('../controllers/preference.controller');

// All routes require authentication
router.use(protect);

// Get user preferences
router.get('/', getUserPreferences);

// Update user preferences
router.patch('/', updateUserPreferences);

// Reset user preferences to defaults
router.delete('/reset', resetUserPreferences);

module.exports = router;
