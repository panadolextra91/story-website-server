const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Record or update reading history
 */
const recordReadingHistory = async (req, res, next) => {
  try {
    const { storyId, chapterId, progress, currentChapterNumber } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!storyId) {
      return next(new AppError('Story ID is required', 400));
    }

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return next(new AppError('Story not found', 404));
    }

    // Check if chapter exists if provided
    if (chapterId) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId }
      });

      if (!chapter) {
        return next(new AppError('Chapter not found', 404));
      }

      // Verify chapter belongs to the story
      if (chapter.storyId !== storyId) {
        return next(new AppError('Chapter does not belong to this story', 400));
      }
    }

    // Prepare update data
    const readingData = {
      userId,
      storyId,
      lastReadAt: new Date()
    };

    if (chapterId) readingData.chapterId = chapterId;
    if (progress !== undefined) readingData.progress = progress;
    if (currentChapterNumber !== undefined) readingData.currentChapterNumber = currentChapterNumber;

    // Check if reading history already exists
    const existingHistory = await prisma.readingHistory.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      }
    });

    let readingHistory;

    if (existingHistory) {
      // Update existing reading history
      readingHistory = await prisma.readingHistory.update({
        where: {
          userId_storyId: {
            userId,
            storyId
          }
        },
        data: readingData,
        include: {
          story: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              author: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          chapter: {
            select: {
              id: true,
              title: true,
              chapterNumber: true
            }
          }
        }
      });
    } else {
      // Create new reading history
      readingHistory = await prisma.readingHistory.create({
        data: readingData,
        include: {
          story: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              author: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          chapter: {
            select: {
              id: true,
              title: true,
              chapterNumber: true
            }
          }
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { readingHistory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's reading history
 */
const getUserReadingHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reading history
    const readingHistory = await prisma.readingHistory.findMany({
      where: {
        userId
      },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            status: true,
            author: {
              select: {
                id: true,
                username: true
              }
            },
            _count: {
              select: {
                chapters: true
              }
            }
          }
        },
        chapter: {
          select: {
            id: true,
            title: true,
            chapterNumber: true
          }
        }
      },
      orderBy: {
        lastReadAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const total = await prisma.readingHistory.count({
      where: {
        userId
      }
    });

    res.status(200).json({
      status: 'success',
      results: readingHistory.length,
      data: {
        readingHistory,
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
 * Get reading history for a specific story
 */
const getStoryReadingHistory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return next(new AppError('Story not found', 404));
    }

    // Get reading history
    const readingHistory = await prisma.readingHistory.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            status: true,
            author: {
              select: {
                id: true,
                username: true
              }
            },
            _count: {
              select: {
                chapters: true
              }
            }
          }
        },
        chapter: {
          select: {
            id: true,
            title: true,
            chapterNumber: true
          }
        }
      }
    });

    if (!readingHistory) {
      return next(new AppError('Reading history not found for this story', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { readingHistory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete reading history
 */
const deleteReadingHistory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Check if reading history exists
    const readingHistory = await prisma.readingHistory.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      }
    });

    if (!readingHistory) {
      return next(new AppError('Reading history not found', 404));
    }

    // Delete reading history
    await prisma.readingHistory.delete({
      where: {
        userId_storyId: {
          userId,
          storyId
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
 * Clear all reading history for a user
 */
const clearReadingHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all reading history for the user
    await prisma.readingHistory.deleteMany({
      where: {
        userId
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

module.exports = {
  recordReadingHistory,
  getUserReadingHistory,
  getStoryReadingHistory,
  deleteReadingHistory,
  clearReadingHistory
};
