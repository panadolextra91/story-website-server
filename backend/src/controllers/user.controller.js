const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');
const { hashPassword } = require('../utils/password');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            stories: true,
            comments: true,
            ratings: true,
            bookmarks: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.user.count();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            stories: true,
            comments: true,
            ratings: true,
            bookmarks: true
          }
        }
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, bio, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if user is authorized to update
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to update this user', 403));
    }

    // Prepare update data
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    
    // If password is provided, hash it
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // If profile picture was uploaded via middleware
    if (req.file && req.file.path) {
      updateData.profilePicture = req.file.path;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if user is authorized to delete
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to delete this user', 403));
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
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
 * Get user's stories
 */
const getUserStories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    const stories = await prisma.story.findMany({
      where: { authorId: id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            chapters: true,
            comments: true,
            ratings: true,
            bookmarks: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.story.count({
      where: { authorId: id }
    });

    // Format the response
    const formattedStories = stories.map(story => {
      const { categories, ...storyData } = story;
      return {
        ...storyData,
        categories: categories.map(c => c.category)
      };
    });

    res.status(200).json({
      status: 'success',
      results: stories.length,
      data: {
        stories: formattedStories,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's bookmarks
 */
const getUserBookmarks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if user is authorized to view bookmarks
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to view these bookmarks', 403));
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: id },
      include: {
        story: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profilePicture: true
              }
            },
            categories: {
              include: {
                category: true
              }
            }
          }
        },
        chapter: true
      },
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const total = await prisma.bookmark.count({
      where: { userId: id }
    });

    // Format the response
    const formattedBookmarks = bookmarks.map(bookmark => {
      const { story, ...bookmarkData } = bookmark;
      const { categories, ...storyData } = story;
      
      return {
        ...bookmarkData,
        story: {
          ...storyData,
          categories: categories.map(c => c.category)
        }
      };
    });

    res.status(200).json({
      status: 'success',
      results: bookmarks.length,
      data: {
        bookmarks: formattedBookmarks,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStories,
  getUserBookmarks
};
