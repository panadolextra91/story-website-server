const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Add comment to story
 */
const addStoryComment = async (req, res, next) => {
  try {
    const { id: storyId } = req.params;
    const { content, parentId } = req.body;
    
    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });
    
    if (!story) {
      return next(new AppError('Story not found', 404));
    }
    
    // If parentId is provided, check if parent comment exists and belongs to the story
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });
      
      if (!parentComment) {
        return next(new AppError('Parent comment not found', 404));
      }
      
      if (parentComment.storyId !== storyId) {
        return next(new AppError('Parent comment does not belong to this story', 400));
      }
    }
    
    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        storyId,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to chapter
 */
const addChapterComment = async (req, res, next) => {
  try {
    const { id: chapterId } = req.params;
    const { content, parentId } = req.body;
    
    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId }
    });
    
    if (!chapter) {
      return next(new AppError('Chapter not found', 404));
    }
    
    // If parentId is provided, check if parent comment exists and belongs to the chapter
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });
      
      if (!parentComment) {
        return next(new AppError('Parent comment not found', 404));
      }
      
      if (parentComment.chapterId !== chapterId) {
        return next(new AppError('Parent comment does not belong to this chapter', 400));
      }
    }
    
    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        chapterId,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update comment
 */
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    // Check if user is authorized to update comment
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to update this comment', 403));
    }
    
    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: { comment: updatedComment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id }
    });
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    // Check if user is authorized to delete comment
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to delete this comment', 403));
    }
    
    // Delete comment and all replies
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id },
          { parentId: id }
        ]
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
 * Get story comments
 */
const getStoryComments = async (req, res, next) => {
  try {
    const { id: storyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });
    
    if (!story) {
      return next(new AppError('Story not found', 404));
    }
    
    // Get comments
    const comments = await prisma.comment.findMany({
      where: { 
        storyId,
        parentId: null // Only get top-level comments
      },
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
      where: { 
        storyId,
        parentId: null
      }
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
  addStoryComment,
  addChapterComment,
  updateComment,
  deleteComment,
  getStoryComments
};
