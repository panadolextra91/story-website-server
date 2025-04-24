const express = require('express');
const { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryStories
} = require('../controllers/category.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/categories
 * @desc Get all categories
 * @access Public
 */
router.get('/', getAllCategories);

/**
 * @route GET /api/categories/:id
 * @desc Get category by ID
 * @access Public
 */
router.get('/:id', getCategoryById);

/**
 * @route POST /api/categories
 * @desc Create new category
 * @access Private/Admin
 */
router.post('/', protect, restrictTo('ADMIN'), createCategory);

/**
 * @route PUT /api/categories/:id
 * @desc Update category
 * @access Private/Admin
 */
router.put('/:id', protect, restrictTo('ADMIN'), updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Delete category
 * @access Private/Admin
 */
router.delete('/:id', protect, restrictTo('ADMIN'), deleteCategory);

/**
 * @route GET /api/categories/:id/stories
 * @desc Get stories by category
 * @access Public
 */
router.get('/:id/stories', getCategoryStories);

module.exports = router;
