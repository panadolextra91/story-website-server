const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserStories,
  getUserBookmarks
} = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { uploadProfilePicture } = require('../middlewares/upload.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

/**
 * @route GET /api/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/', restrictTo('ADMIN'), getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private
 */
router.put('/:id', uploadProfilePicture, updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private
 */
router.delete('/:id', deleteUser);

/**
 * @route GET /api/users/:id/stories
 * @desc Get user's stories
 * @access Private
 */
router.get('/:id/stories', getUserStories);

/**
 * @route GET /api/users/:id/bookmarks
 * @desc Get user's bookmarks
 * @access Private
 */
router.get('/:id/bookmarks', getUserBookmarks);

module.exports = router;
