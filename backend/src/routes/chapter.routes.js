const express = require('express');
const { 
  getChapterById, 
  updateChapter, 
  deleteChapter,
  getChapterComments
} = require('../controllers/chapter.controller');
const { protect } = require('../middlewares/auth.middleware');
const { addChapterComment } = require('../controllers/comment.controller');

const router = express.Router();

/**
 * @route GET /api/chapters/:id
 * @desc Get chapter by ID
 * @access Public
 */
router.get('/:id', getChapterById);

/**
 * @route PUT /api/chapters/:id
 * @desc Update chapter
 * @access Private
 */
router.put('/:id', protect, updateChapter);

/**
 * @route DELETE /api/chapters/:id
 * @desc Delete chapter
 * @access Private
 */
router.delete('/:id', protect, deleteChapter);

/**
 * @route GET /api/chapters/:id/comments
 * @desc Get chapter comments
 * @access Public
 */
router.get('/:id/comments', getChapterComments);

/**
 * @route POST /api/chapters/:id/comments
 * @desc Add comment to chapter
 * @access Private
 */
router.post('/:id/comments', protect, addChapterComment);

module.exports = router;
