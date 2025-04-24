const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');
const ViewService = require('../services/view.service');

/**
 * Get all stories with filtering and pagination
 */
const getAllStories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      categoryId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = {};
    
    // Filter by status
    if (status) {
      where.status = status;
    } else {
      // By default, only show published and completed stories
      where.status = { in: ['PUBLISHED', 'COMPLETED'] };
    }
    
    // Filter by category
    if (categoryId) {
      where.categories = {
        some: {
          categoryId
        }
      };
    }
    
    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Build sort options
    const orderBy = {};
    
    // Valid sort fields
    const validSortFields = ['createdAt', 'updatedAt', 'viewCount', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    orderBy[sortField] = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    // Get stories
    const stories = await prisma.story.findMany({
      where,
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
      take: parseInt(limit),
      orderBy
    });
    
    // Get total count for pagination
    const total = await prisma.story.count({ where });
    
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
 * Get story by ID
 */
const getStoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            bio: true
          }
        },
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
      }
    });
    
    if (!story) {
      return next(new AppError('Story not found', 404));
    }
    
    // Record view with sophisticated tracking
    const viewData = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.id : null
    };
    
    await ViewService.recordStoryView(id, viewData);
    
    // Record or update reading history if user is authenticated
    if (req.user) {
      try {
        // Check if story exists in reading history
        const existingHistory = await prisma.readingHistory.findUnique({
          where: {
            userId_storyId: {
              userId: req.user.id,
              storyId: id
            }
          }
        });
        
        if (existingHistory) {
          // Update last read timestamp
          await prisma.readingHistory.update({
            where: {
              userId_storyId: {
                userId: req.user.id,
                storyId: id
              }
            },
            data: {
              lastReadAt: new Date()
            }
          });
        } else {
          // Create new reading history entry
          await prisma.readingHistory.create({
            data: {
              userId: req.user.id,
              storyId: id
            }
          });
        }
      } catch (historyError) {
        // Log error but don't fail the request
        console.error('Error recording reading history:', historyError);
      }
    }
    
    // Format the response
    const { categories, ...storyData } = story;
    const formattedStory = {
      ...storyData,
      categories: categories.map(c => c.category)
    };
    
    res.status(200).json({
      status: 'success',
      data: { story: formattedStory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new story
 */
const createStory = async (req, res, next) => {
  try {
    const { title, description, status = 'DRAFT', categoryIds } = req.body;
    
    // All users can create stories in the new system
    
    // Create story
    const newStory = await prisma.story.create({
      data: {
        title,
        description,
        status,
        authorId: req.user.id,
        coverImage: req.file ? req.file.path : null
      }
    });
    
    // Connect categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categoryConnections = categoryIds.map(categoryId => ({
        storyId: newStory.id,
        categoryId
      }));
      
      await prisma.categoryOnStory.createMany({
        data: categoryConnections
      });
    }
    
    // Get the created story with categories
    const story = await prisma.story.findUnique({
      where: { id: newStory.id },
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
    });
    
    // Format the response
    const { categories, ...storyData } = story;
    const formattedStory = {
      ...storyData,
      categories: categories.map(c => c.category)
    };
    
    res.status(201).json({
      status: 'success',
      data: { story: formattedStory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update story
 */
const updateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, categoryIds } = req.body;
    
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true }
        }
      }
    });
    
    if (!existingStory) {
      return next(new AppError('Story not found', 404));
    }
    
    // Check if user is authorized to update
    if (existingStory.author.id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to update this story', 403));
    }
    
    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    
    // If cover image was uploaded via middleware
    if (req.file && req.file.path) {
      updateData.coverImage = req.file.path;
    }
    
    // Update story
    const updatedStory = await prisma.story.update({
      where: { id },
      data: updateData
    });
    
    // Update categories if provided
    if (categoryIds && categoryIds.length > 0) {
      // Remove existing category connections
      await prisma.categoryOnStory.deleteMany({
        where: { storyId: id }
      });
      
      // Create new category connections
      const categoryConnections = categoryIds.map(categoryId => ({
        storyId: id,
        categoryId
      }));
      
      await prisma.categoryOnStory.createMany({
        data: categoryConnections
      });
    }
    
    // Get the updated story with categories
    const story = await prisma.story.findUnique({
      where: { id },
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
    });
    
    // Format the response
    const { categories, ...storyData } = story;
    const formattedStory = {
      ...storyData,
      categories: categories.map(c => c.category)
    };
    
    res.status(200).json({
      status: 'success',
      data: { story: formattedStory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete story
 */
const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true }
        }
      }
    });
    
    if (!existingStory) {
      return next(new AppError('Story not found', 404));
    }
    
    // Check if user is authorized to delete
    if (existingStory.author.id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to delete this story', 403));
    }
    
    // Delete story (cascades to chapters, comments, etc.)
    await prisma.story.delete({
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
 * Get story chapters
 */
const getStoryChapters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id }
    });
    
    if (!existingStory) {
      return next(new AppError('Story not found', 404));
    }
    
    // Get chapters
    const chapters = await prisma.chapter.findMany({
      where: { storyId: id },
      select: {
        id: true,
        title: true,
        chapterNumber: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        chapterNumber: 'asc'
      }
    });
    
    const total = await prisma.chapter.count({
      where: { storyId: id }
    });
    
    res.status(200).json({
      status: 'success',
      results: chapters.length,
      data: {
        chapters,
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
 * Get story ratings
 */
const getStoryRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id }
    });
    
    if (!existingStory) {
      return next(new AppError('Story not found', 404));
    }
    
    // Get ratings
    const ratings = await prisma.rating.findMany({
      where: { storyId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate average rating
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    
    // Count ratings by value
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    ratings.forEach(rating => {
      ratingCounts[rating.rating]++;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        ratings,
        stats: {
          count: totalRatings,
          average: averageRating,
          distribution: ratingCounts
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rate a story
 */
const rateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }
    
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id }
    });
    
    if (!existingStory) {
      return next(new AppError('Story not found', 404));
    }
    
    // Check if user has already rated this story
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storyId: {
          userId: req.user.id,
          storyId: id
        }
      }
    });
    
    let userRating;
    
    if (existingRating) {
      // Update existing rating
      userRating = await prisma.rating.update({
        where: {
          userId_storyId: {
            userId: req.user.id,
            storyId: id
          }
        },
        data: { rating }
      });
    } else {
      // Create new rating
      userRating = await prisma.rating.create({
        data: {
          rating,
          userId: req.user.id,
          storyId: id
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { rating: userRating }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bookmark a story
 */
const bookmarkStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chapterId } = req.body;
    
    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id }
    });
    
    if (!existingStory) {
      return next(new AppError('Story not found', 404));
    }
    
    // If chapterId is provided, check if it belongs to the story
    if (chapterId) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });
      
      if (!chapter || chapter.storyId !== id) {
        return next(new AppError('Invalid chapter for this story', 400));
      }
    }
    
    // Check if user has already bookmarked this story
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_storyId: {
          userId: req.user.id,
          storyId: id
        }
      }
    });
    
    let bookmark;
    
    if (existingBookmark) {
      // Update existing bookmark
      bookmark = await prisma.bookmark.update({
        where: {
          userId_storyId: {
            userId: req.user.id,
            storyId: id
          }
        },
        data: { chapterId }
      });
    } else {
      // Create new bookmark
      bookmark = await prisma.bookmark.create({
        data: {
          userId: req.user.id,
          storyId: id,
          chapterId
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { bookmark }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove bookmark
 */
const removeBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_storyId: {
          userId: req.user.id,
          storyId: id
        }
      }
    });
    
    if (!existingBookmark) {
      return next(new AppError('Bookmark not found', 404));
    }
    
    // Delete bookmark
    await prisma.bookmark.delete({
      where: {
        userId_storyId: {
          userId: req.user.id,
          storyId: id
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
 * Get story view statistics
 */
const getStoryViewStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id },
      select: { id: true, authorId: true }
    });
    
    if (!story) {
      return next(new AppError('Story not found', 404));
    }
    
    // Check if user is authorized to view stats (author or admin)
    if (req.user.id !== story.authorId && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to view these statistics', 403));
    }
    
    // Get view statistics
    const stats = await ViewService.getStoryViewStats(id);
    
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search stories by title
 */
const searchStories = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return next(new AppError('Search query is required', 400));
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Search stories by title (case insensitive)
    const stories = await prisma.story.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
        // Only include published and completed stories
        status: { in: ['PUBLISHED', 'COMPLETED'] }
      },
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
      take: parseInt(limit),
      orderBy: {
        viewCount: 'desc' // Sort by popularity
      }
    });
    
    // Get total count for pagination
    const total = await prisma.story.count({
      where: {
        title: { contains: query, mode: 'insensitive' },
        status: { in: ['PUBLISHED', 'COMPLETED'] }
      }
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

module.exports = {
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
};
