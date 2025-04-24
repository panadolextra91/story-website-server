const express = require('express');
const { 
  updateComment, 
  deleteComment
} = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route PUT /api/comments/:id
 * @desc Update comment
 * @access Private
 */
router.put('/:id', protect, updateComment);

/**
 * @route DELETE /api/comments/:id
 * @desc Delete comment
 * @access Private
 */
router.delete('/:id', protect, deleteComment);

module.exports = router;
