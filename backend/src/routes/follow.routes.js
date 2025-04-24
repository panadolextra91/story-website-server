const express = require('express');
const { 
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  checkFollowStatus,
  getFollowCounts
} = require('../controllers/follow.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route POST /api/follows/:userId
 * @desc Follow a user
 * @access Private
 */
router.post('/:userId', followUser);

/**
 * @route DELETE /api/follows/:userId
 * @desc Unfollow a user
 * @access Private
 */
router.delete('/:userId', unfollowUser);

/**
 * @route GET /api/follows/:userId/followers
 * @desc Get followers of a user
 * @access Private
 */
router.get('/:userId/followers', getUserFollowers);

/**
 * @route GET /api/follows/:userId/following
 * @desc Get users that a user is following
 * @access Private
 */
router.get('/:userId/following', getUserFollowing);

/**
 * @route GET /api/follows/:userId/status
 * @desc Check if the authenticated user is following another user
 * @access Private
 */
router.get('/:userId/status', checkFollowStatus);

/**
 * @route GET /api/follows/:userId/counts
 * @desc Get follow counts for a user
 * @access Private
 */
router.get('/:userId/counts', getFollowCounts);

module.exports = router;
