const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Get user preferences
 */
const getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find user preferences
    let preferences = await prisma.userPreference.findUnique({
      where: {
        userId
      }
    });

    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          fontFamily: 'Arial',
          fontSize: 16,
          theme: 'light'
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences
 */
const updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fontFamily, fontSize, theme } = req.body;

    // Validate font family
    if (fontFamily && !['Times New Roman', 'Roboto', 'Arial'].includes(fontFamily)) {
      return next(new AppError('Font family must be Times New Roman, Roboto, or Arial', 400));
    }

    // Validate font size
    if (fontSize && (typeof fontSize !== 'number' || fontSize < 8 || fontSize > 32)) {
      return next(new AppError('Font size must be a number between 8 and 32', 400));
    }

    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return next(new AppError('Theme must be light or dark', 400));
    }

    // Prepare update data
    const updateData = {};
    if (fontFamily) updateData.fontFamily = fontFamily;
    if (fontSize) updateData.fontSize = fontSize;
    if (theme) updateData.theme = theme;

    // Check if preferences exist
    const existingPreferences = await prisma.userPreference.findUnique({
      where: {
        userId
      }
    });

    let preferences;

    if (existingPreferences) {
      // Update existing preferences
      preferences = await prisma.userPreference.update({
        where: {
          userId
        },
        data: updateData
      });
    } else {
      // Create new preferences
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          ...updateData
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset user preferences to defaults
 */
const resetUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if preferences exist
    const existingPreferences = await prisma.userPreference.findUnique({
      where: {
        userId
      }
    });

    if (!existingPreferences) {
      // Create default preferences if they don't exist
      const preferences = await prisma.userPreference.create({
        data: {
          userId,
          fontFamily: 'Arial',
          fontSize: 16,
          theme: 'light'
        }
      });

      return res.status(200).json({
        status: 'success',
        data: { preferences }
      });
    }

    // Reset to defaults
    const preferences = await prisma.userPreference.update({
      where: {
        userId
      },
      data: {
        fontFamily: 'Arial',
        fontSize: 16,
        theme: 'light'
      }
    });

    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences
};
