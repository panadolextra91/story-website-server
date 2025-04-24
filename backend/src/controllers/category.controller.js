const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get all categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            stories: true
          }
        }
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stories: true
          }
        }
      }
    });
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category (admin only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { name }
    });
    
    if (existingCategory) {
      return next(new AppError('Category with this name already exists', 400));
    }
    
    // Create category
    const newCategory = await prisma.category.create({
      data: {
        name,
        description
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: { category: newCategory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (admin only)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return next(new AppError('Category not found', 404));
    }
    
    // If name is being updated, check if it already exists
    if (name && name !== existingCategory.name) {
      const categoryWithName = await prisma.category.findFirst({
        where: { name }
      });
      
      if (categoryWithName) {
        return next(new AppError('Category with this name already exists', 400));
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      status: 'success',
      data: { category: updatedCategory }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (admin only)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return next(new AppError('Category not found', 404));
    }
    
    // Check if category has stories
    const storiesCount = await prisma.categoryOnStory.count({
      where: { categoryId: id }
    });
    
    if (storiesCount > 0) {
      return next(new AppError('Cannot delete category that has stories. Remove the stories first or reassign them to another category.', 400));
    }
    
    // Delete category
    await prisma.category.delete({
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
 * Get stories by category
 */
const getCategoryStories = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    // Get stories
    const stories = await prisma.story.findMany({
      where: {
        categories: {
          some: {
            categoryId: id
          }
        },
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
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const total = await prisma.story.count({
      where: {
        categories: {
          some: {
            categoryId: id
          }
        },
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
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStories
};
