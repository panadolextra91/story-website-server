const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  recordReadingHistory,
  getUserReadingHistory,
  getStoryReadingHistory,
  deleteReadingHistory,
  clearReadingHistory
} = require('../controllers/reading-history.controller');

// All routes require authentication
router.use(protect);

// Record or update reading history
router.post('/', recordReadingHistory);

// Get user's reading history
router.get('/', getUserReadingHistory);

// Get reading history for a specific story
router.get('/story/:storyId', getStoryReadingHistory);

// Delete reading history for a specific story
router.delete('/story/:storyId', deleteReadingHistory);

// Clear all reading history
router.delete('/', clearReadingHistory);

module.exports = router;
