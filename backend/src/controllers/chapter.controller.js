const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get chapter by ID
 */
const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const chapter = await prisma.chapter.findUnique({
      where: { id },
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
        }
      }
    });
    
    if (!chapter) {
      return next(new AppError('Chapter not found', 404));
    }
    
    // Record or update reading history if user is authenticated
    if (req.user) {
      try {
        // Check if story exists in reading history
        const existingHistory = await prisma.readingHistory.findUnique({
          where: {
            userId_storyId: {
              userId: req.user.id,
              storyId: chapter.storyId
            }
          }
        });
        
        if (existingHistory) {
          // Update last read timestamp and chapter information
          await prisma.readingHistory.update({
            where: {
              userId_storyId: {
                userId: req.user.id,
                storyId: chapter.storyId
              }
            },
            data: {
              lastReadAt: new Date(),
              chapterId: id,
              currentChapterNumber: chapter.chapterNumber
            }
          });
        } else {
          // Create new reading history entry
          await prisma.readingHistory.create({
            data: {
              userId: req.user.id,
              storyId: chapter.storyId,
              chapterId: id,
              currentChapterNumber: chapter.chapterNumber
            }
          });
        }
      } catch (historyError) {
        // Log error but don't fail the request
        console.error('Error recording reading history:', historyError);
      }
    }
    
    // Format the response
    const { story, ...chapterData } = chapter;
    const { categories, ...storyData } = story;
    
    const formattedChapter = {
      ...chapterData,
      story: {
        ...storyData,
        categories: categories.map(c => c.category)
      }
    };
    
    res.status(200).json({
      status: 'success',
      data: { chapter: formattedChapter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new chapter
 */
const createChapter = async (req, res, next) => {
  try {
    const storyId = req.params.id; // Using 'id' from route parameter
    const { title, content, chapterNumber } = req.body;
    
    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: { id: true }
        }
      }
    });
    
    if (!story) {
      return next(new AppError('Story not found', 404));
    }
    
    // Check if user is authorized to add chapter
    if (story.author.id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to add chapters to this story', 403));
    }
    
    // Calculate word count
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    // If chapterNumber is not provided, find the highest chapter number and add 1
    let nextChapterNumber = chapterNumber;
    
    if (!nextChapterNumber) {
      const highestChapter = await prisma.chapter.findFirst({
        where: { storyId },
        orderBy: { chapterNumber: 'desc' }
      });
      
      nextChapterNumber = highestChapter ? highestChapter.chapterNumber + 1 : 1;
    } else {
      // Check if chapter number already exists
      const existingChapter = await prisma.chapter.findFirst({
        where: {
          storyId,
          chapterNumber: parseInt(nextChapterNumber)
        }
      });
      
      if (existingChapter) {
        return next(new AppError(`Chapter number ${nextChapterNumber} already exists for this story`, 400));
      }
    }
    
    // Create chapter
    const newChapter = await prisma.chapter.create({
      data: {
        title,
        content,
        chapterNumber: parseInt(nextChapterNumber),
        wordCount,
        storyId
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: { chapter: newChapter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update chapter
 */
const updateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, chapterNumber } = req.body;
    
    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        story: {
          include: {
            author: {
              select: { id: true }
            }
          }
        }
      }
    });
    
    if (!chapter) {
      return next(new AppError('Chapter not found', 404));
    }
    
    // Check if user is authorized to update chapter
    if (chapter.story.author.id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to update this chapter', 403));
    }
    
    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title;
    
    if (content) {
      updateData.content = content;
      // Recalculate word count
      updateData.wordCount = content.split(/\s+/).filter(Boolean).length;
    }
    
    if (chapterNumber && chapterNumber !== chapter.chapterNumber) {
      // Check if chapter number already exists
      const existingChapter = await prisma.chapter.findFirst({
        where: {
          storyId: chapter.storyId,
          chapterNumber: parseInt(chapterNumber),
          id: { not: id } // Exclude current chapter
        }
      });
      
      if (existingChapter) {
        return next(new AppError(`Chapter number ${chapterNumber} already exists for this story`, 400));
      }
      
      updateData.chapterNumber = parseInt(chapterNumber);
    }
    
    // Update chapter
    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      status: 'success',
      data: { chapter: updatedChapter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete chapter
 */
const deleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        story: {
          include: {
            author: {
              select: { id: true }
            }
          }
        }
      }
    });
    
    if (!chapter) {
      return next(new AppError('Chapter not found', 404));
    }
    
    // Check if user is authorized to delete chapter
    if (chapter.story.author.id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to delete this chapter', 403));
    }
    
    // Delete chapter
    await prisma.chapter.delete({
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
 * Get chapter comments
 */
const getChapterComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id }
    });
    
    if (!chapter) {
      return next(new AppError('Chapter not found', 404));
    }
    
    // Get comments
    const comments = await prisma.comment.findMany({
      where: { chapterId: id, parentId: null }, // Only get top-level comments
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        },
        replies: {
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
            createdAt: 'asc'
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const total = await prisma.comment.count({
      where: { chapterId: id, parentId: null }
    });
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments,
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
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterComments
};
