const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get all drafts for the current user
 */
const getUserDrafts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query filters
    const where = { authorId: userId };
    
    // Filter by draft type if provided
    if (type && ['STORY', 'CHAPTER'].includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }
    
    // Get drafts
    const drafts = await prisma.draft.findMany({
      where,
      include: {
        story: type === 'CHAPTER' ? {
          select: {
            id: true,
            title: true
          }
        } : undefined
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Get total count for pagination
    const total = await prisma.draft.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: drafts.length,
      data: {
        drafts,
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
 * Get a draft by ID
 */
const getDraftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const draft = await prisma.draft.findUnique({
      where: { id },
      include: {
        story: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }
    
    // Check if user is the author of the draft
    if (draft.authorId !== userId) {
      return next(new AppError('You are not authorized to access this draft', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: { draft }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new story draft
 */
const createStoryDraft = async (req, res, next) => {
  try {
    const { title, content, description, coverImage } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title) {
      return next(new AppError('Title is required', 400));
    }
    
    // Create draft
    const draft = await prisma.draft.create({
      data: {
        title,
        content: content || '',
        type: 'STORY',
        description,
        coverImage,
        authorId: userId
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: { draft }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new chapter draft
 */
const createChapterDraft = async (req, res, next) => {
  try {
    const { title, content, storyId, chapterNumber } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title) {
      return next(new AppError('Title is required', 400));
    }
    
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
    
    // For testing purposes, allow admin users to create drafts for any story
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (story.authorId !== userId && user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to create drafts for this story', 403));
    }
    
    // Determine chapter number if not provided
    let nextChapterNumber = chapterNumber;
    
    if (!nextChapterNumber) {
      // Find the highest chapter number for this story
      const highestChapter = await prisma.chapter.findFirst({
        where: { storyId },
        orderBy: { chapterNumber: 'desc' }
      });
      
      nextChapterNumber = highestChapter ? highestChapter.chapterNumber + 1 : 1;
    }
    
    // Create draft
    const draft = await prisma.draft.create({
      data: {
        title,
        content: content || '',
        type: 'CHAPTER',
        storyId,
        chapterNumber: nextChapterNumber,
        authorId: userId
      },
      include: {
        story: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: { draft }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a draft
 */
const updateDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, description, coverImage, chapterNumber } = req.body;
    const userId = req.user.id;
    
    // Check if draft exists and user is the author
    const existingDraft = await prisma.draft.findUnique({
      where: { id }
    });
    
    if (!existingDraft) {
      return next(new AppError('Draft not found', 404));
    }
    
    if (existingDraft.authorId !== userId) {
      return next(new AppError('You are not authorized to update this draft', 403));
    }
    
    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    
    // Story-specific fields
    if (existingDraft.type === 'STORY') {
      if (description !== undefined) updateData.description = description;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
    }
    
    // Chapter-specific fields
    if (existingDraft.type === 'CHAPTER' && chapterNumber !== undefined) {
      updateData.chapterNumber = chapterNumber;
    }
    
    // Update draft
    const draft = await prisma.draft.update({
      where: { id },
      data: updateData,
      include: {
        story: existingDraft.type === 'CHAPTER' ? {
          select: {
            id: true,
            title: true
          }
        } : undefined
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: { draft }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a draft
 */
const deleteDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if draft exists and user is the author
    const draft = await prisma.draft.findUnique({
      where: { id }
    });
    
    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }
    
    if (draft.authorId !== userId) {
      return next(new AppError('You are not authorized to delete this draft', 403));
    }
    
    // Delete draft
    await prisma.draft.delete({
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
 * Publish a story draft
 */
const publishStoryDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { categoryIds } = req.body;
    
    // Check if draft exists and user is the author
    const draft = await prisma.draft.findUnique({
      where: { id }
    });
    
    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }
    
    if (draft.authorId !== userId) {
      return next(new AppError('You are not authorized to publish this draft', 403));
    }
    
    if (draft.type !== 'STORY') {
      return next(new AppError('This draft is not a story draft', 400));
    }
    
    // Create story from draft
    const story = await prisma.story.create({
      data: {
        title: draft.title,
        description: draft.description || '',
        coverImage: draft.coverImage,
        status: 'PUBLISHED',
        authorId: userId,
        ...(categoryIds && categoryIds.length > 0 && {
          categories: {
            create: categoryIds.map(categoryId => ({
              category: {
                connect: { id: categoryId }
              }
            }))
          }
        })
      }
    });
    
    // Delete the draft
    await prisma.draft.delete({
      where: { id }
    });
    
    res.status(200).json({
      status: 'success',
      data: { story }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish a chapter draft
 */
const publishChapterDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if draft exists and user is the author
    const draft = await prisma.draft.findUnique({
      where: { id }
    });
    
    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }
    
    if (draft.authorId !== userId) {
      return next(new AppError('You are not authorized to publish this draft', 403));
    }
    
    if (draft.type !== 'CHAPTER') {
      return next(new AppError('This draft is not a chapter draft', 400));
    }
    
    if (!draft.storyId) {
      return next(new AppError('This draft is not associated with a story', 400));
    }
    
    // Check if story exists and user is the author
    const story = await prisma.story.findUnique({
      where: { id: draft.storyId }
    });
    
    if (!story) {
      return next(new AppError('Story not found', 404));
    }
    
    // For testing purposes, allow admin users to publish chapters for any story
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (story.authorId !== userId && user.role !== 'ADMIN') {
      return next(new AppError('You are not authorized to publish chapters for this story', 403));
    }
    
    // Check if chapter number already exists
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        storyId: draft.storyId,
        chapterNumber: draft.chapterNumber
      }
    });
    
    if (existingChapter) {
      return next(new AppError(`Chapter ${draft.chapterNumber} already exists for this story`, 400));
    }
    
    // Calculate word count
    const wordCount = draft.content.split(/\s+/).filter(Boolean).length;
    
    // Create chapter from draft
    const chapter = await prisma.chapter.create({
      data: {
        title: draft.title,
        content: draft.content,
        chapterNumber: draft.chapterNumber,
        storyId: draft.storyId,
        wordCount
      }
    });
    
    // Delete the draft
    await prisma.draft.delete({
      where: { id }
    });
    
    // Update story status if it was in DRAFT status
    if (story.status === 'DRAFT') {
      await prisma.story.update({
        where: { id: story.id },
        data: { status: 'PUBLISHED' }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { chapter }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDrafts,
  getDraftById,
  createStoryDraft,
  createChapterDraft,
  updateDraft,
  deleteDraft,
  publishStoryDraft,
  publishChapterDraft
};
