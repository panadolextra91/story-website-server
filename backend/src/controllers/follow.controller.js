const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Follow a user
 */
const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToFollow) {
      return next(new AppError('User not found', 404));
    }

    // Prevent following yourself
    if (userId === followerId) {
      return next(new AppError('You cannot follow yourself', 400));
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    if (existingFollow) {
      return next(new AppError('You are already following this user', 400));
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: userId
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            bio: true,
            role: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        follow: {
          id: follow.id,
          createdAt: follow.createdAt,
          user: follow.following
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    if (!follow) {
      return next(new AppError('You are not following this user', 400));
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get followers of a user
 */
const getUserFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get followers
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            bio: true,
            role: true,
            _count: {
              select: {
                followers: true,
                following: true,
                stories: true
              }
            }
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.follow.count({
      where: {
        followingId: userId
      }
    });

    // Format response
    const formattedFollowers = followers.map(follow => ({
      id: follow.id,
      createdAt: follow.createdAt,
      user: follow.follower
    }));

    res.status(200).json({
      status: 'success',
      results: followers.length,
      data: {
        followers: formattedFollowers,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users that a user is following
 */
const getUserFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get following
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            bio: true,
            role: true,
            _count: {
              select: {
                followers: true,
                following: true,
                stories: true
              }
            }
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.follow.count({
      where: {
        followerId: userId
      }
    });

    // Format response
    const formattedFollowing = following.map(follow => ({
      id: follow.id,
      createdAt: follow.createdAt,
      user: follow.following
    }));

    res.status(200).json({
      status: 'success',
      results: following.length,
      data: {
        following: formattedFollowing,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a user is following another user
 */
const checkFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        isFollowing: !!follow,
        followId: follow ? follow.id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get follow counts for a user
 */
const getFollowCounts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get counts
    const followerCount = await prisma.follow.count({
      where: {
        followingId: userId
      }
    });

    const followingCount = await prisma.follow.count({
      where: {
        followerId: userId
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        followerCount,
        followingCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  checkFollowStatus,
  getFollowCounts
};
