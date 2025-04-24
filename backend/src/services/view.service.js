const { prisma } = require('../config/db.config');

/**
 * Service for handling story view counting with sophisticated tracking
 */
class ViewService {
  /**
   * Record a view for a story with anti-duplicate measures
   * @param {string} storyId - The ID of the story being viewed
   * @param {object} viewData - Data about the view
   * @param {string} viewData.ip - IP address of the viewer (optional)
   * @param {string} viewData.userAgent - User agent of the viewer (optional)
   * @param {string} viewData.userId - ID of the user if logged in (optional)
   * @returns {Promise<object>} The updated story view counts
   */
  static async recordStoryView(storyId, { ip, userAgent, userId }) {
    // Find the story
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, viewCount: true }
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Check if this is a duplicate view from the same source within a time window
    const recentViewWindow = new Date();
    recentViewWindow.setHours(recentViewWindow.getHours() - 1); // 1 hour window

    // Build the query to check for recent views
    const whereClause = {
      storyId,
      viewedAt: { gte: recentViewWindow }
    };

    // Add user identifier conditions if available
    if (userId) {
      whereClause.userId = userId;
    } else if (ip) {
      whereClause.ip = ip;
      if (userAgent) {
        whereClause.userAgent = userAgent;
      }
    }

    // Check for recent views from this source
    const recentView = await prisma.storyView.findFirst({
      where: whereClause
    });

    // If no recent view found, record this as a new view
    if (!recentView) {
      // Create a new view record
      await prisma.storyView.create({
        data: {
          storyId,
          userId,
          ip,
          userAgent
        }
      });

      // Check if this is a unique viewer (based on user ID or IP)
      const uniqueViewerExists = await prisma.storyView.findFirst({
        where: {
          storyId,
          OR: [
            { userId: userId ? userId : undefined },
            { ip: ip ? ip : undefined }
          ],
          viewedAt: { lt: recentViewWindow }
        }
      });

      // Update story view count
      return await prisma.story.update({
        where: { id: storyId },
        data: {
          viewCount: { increment: 1 }
        },
        select: {
          viewCount: true
        }
      });
    }

    // If a recent view was found, don't increment counts
    return {
      viewCount: story.viewCount
    };
  }

  /**
   * Get view statistics for a story
   * @param {string} storyId - The ID of the story
   * @returns {Promise<object>} View statistics
   */
  static async getStoryViewStats(storyId) {
    // Get basic view counts
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        viewCount: true
      }
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Get view count for last 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const views24Hours = await prisma.storyView.count({
      where: {
        storyId,
        viewedAt: { gte: last24Hours }
      }
    });

    // Get view count for last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const views7Days = await prisma.storyView.count({
      where: {
        storyId,
        viewedAt: { gte: last7Days }
      }
    });

    // Get view count for last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const views30Days = await prisma.storyView.count({
      where: {
        storyId,
        viewedAt: { gte: last30Days }
      }
    });

    return {
      totalViews: story.viewCount,
      last24Hours: views24Hours,
      last7Days: views7Days,
      last30Days: views30Days
    };
  }
}

module.exports = ViewService;
