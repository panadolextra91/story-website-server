const express = require('express');
const { 
  getAllStories, 
  getStoryById, 
  createStory, 
  updateStory, 
  deleteStory,
  getStoryChapters,
  getStoryRatings,
  rateStory,
  bookmarkStory,
  removeBookmark,
  getStoryViewStats,
  searchStories
} = require('../controllers/story.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { uploadStoryCover } = require('../middlewares/upload.middleware');
const { createChapter } = require('../controllers/chapter.controller');
const { getStoryComments, addStoryComment } = require('../controllers/comment.controller');

const router = express.Router();

/**
 * @route GET /api/stories
 * @desc Get all stories with filtering and pagination
 * @access Public
 */
router.get('/', getAllStories);

/**
 * @route GET /api/stories/search
 * @desc Search stories by title
 * @access Public
 */
router.get('/search', searchStories);

/**
 * @route GET /api/stories/:id
 * @desc Get story by ID
 * @access Public
 */
router.get('/:id', getStoryById);

/**
 * @route POST /api/stories
 * @desc Create new story
 * @access Private/Author/Admin
 */
router.post('/', protect, restrictTo('AUTHOR', 'ADMIN'), uploadStoryCover, createStory);

/**
 * @route PUT /api/stories/:id
 * @desc Update story
 * @access Private/Author/Admin
 */
router.put('/:id', protect, uploadStoryCover, updateStory);

/**
 * @route DELETE /api/stories/:id
 * @desc Delete story
 * @access Private/Author/Admin
 */
router.delete('/:id', protect, deleteStory);

/**
 * @route GET /api/stories/:id/chapters
 * @desc Get story chapters
 * @access Public
 */
router.get('/:id/chapters', getStoryChapters);

/**
 * @route POST /api/stories/:id/chapters
 * @desc Create new chapter
 * @access Private/Author/Admin
 */
router.post('/:id/chapters', protect, createChapter);

/**
 * @route GET /api/stories/:id/comments
 * @desc Get story comments
 * @access Public
 */
router.get('/:id/comments', getStoryComments);

/**
 * @route POST /api/stories/:id/comments
 * @desc Add comment to story
 * @access Private
 */
router.post('/:id/comments', protect, addStoryComment);

/**
 * @route GET /api/stories/:id/ratings
 * @desc Get story ratings
 * @access Public
 */
router.get('/:id/ratings', getStoryRatings);

/**
 * @route POST /api/stories/:id/ratings
 * @desc Rate a story
 * @access Private
 */
router.post('/:id/ratings', protect, rateStory);

/**
 * @route POST /api/stories/:id/bookmark
 * @desc Bookmark a story
 * @access Private
 */
router.post('/:id/bookmark', protect, bookmarkStory);

/**
 * @route DELETE /api/stories/:id/bookmark
 * @desc Remove bookmark
 * @access Private
 */
router.delete('/:id/bookmark', protect, removeBookmark);

/**
 * @route GET /api/stories/:id/stats
 * @desc Get story view statistics
 * @access Private/Author/Admin
 */
router.get('/:id/stats', protect, getStoryViewStats);

module.exports = router;
