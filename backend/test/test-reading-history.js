/**
 * Reading History API Test Script
 * 
 * This script tests the reading history API endpoints
 * Run with: node test/test-reading-history.js
 */

const axios = require('axios');

// Simple color functions to replace chalk
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Create a simple chalk-like API
const chalk = {
  red: (text) => `${colors.red}${text}${colors.reset}`,
  green: (text) => `${colors.green}${text}${colors.reset}`,
  yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
  blue: (text) => `${colors.blue}${text}${colors.reset}`,
  cyan: (text) => `${colors.cyan}${text}${colors.reset}`,
  bold: {
    red: (text) => `${colors.bold}${colors.red}${text}${colors.reset}`,
    green: (text) => `${colors.bold}${colors.green}${text}${colors.reset}`,
    yellow: (text) => `${colors.bold}${colors.yellow}${text}${colors.reset}`,
    blue: (text) => `${colors.bold}${colors.blue}${text}${colors.reset}`,
    cyan: (text) => `${colors.bold}${colors.cyan}${text}${colors.reset}`
  }
};

// Configuration - MODIFY THESE VALUES WITH YOUR ACTUAL CREDENTIALS
const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Global variables to store data between requests
let authToken;
let userId;
let storyId;
let chapterId;

// Helper function to log responses
const logResponse = (title, response) => {
  console.log(chalk.bold.blue(`\n=== ${title} ===`));
  console.log(chalk.green('Status:'), response.status);
  console.log(chalk.green('Data:'), JSON.stringify(response.data, null, 2));
};

// Helper function to log errors
const logError = (title, error) => {
  console.log(chalk.bold.red(`\n=== ${title} ===`));
  console.log(chalk.red('Error:'), error.message);
  if (error.response) {
    console.log(chalk.red('Status:'), error.response.status);
    console.log(chalk.red('Data:'), JSON.stringify(error.response.data, null, 2));
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log(chalk.bold.yellow('\n🚀 Starting Reading History API Tests'));

    // 1. Login to get authentication token
    try {
      console.log(chalk.cyan('\nLogging in...'));
      const loginResponse = await axios.post(`${API_URL}/auth/login`, TEST_USER);
      authToken = loginResponse.data.data.token;
      userId = loginResponse.data.data.user.id;
      logResponse('Login Successful', loginResponse);
      console.log(chalk.cyan(`Auth Token: ${authToken.substring(0, 20)}...`));
      console.log(chalk.cyan(`User ID: ${userId}`));
    } catch (error) {
      logError('Login Failed', error);
      console.log(chalk.red('Please update the TEST_USER credentials in the script.'));
      return;
    }

    // Set default headers for all subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // 2. Get all stories to find a story ID for testing
    try {
      console.log(chalk.cyan('\nFetching stories...'));
      const storiesResponse = await axios.get(`${API_URL}/stories`);
      storyId = storiesResponse.data.data.stories[0].id;
      logResponse('Got Stories', storiesResponse);
      console.log(chalk.cyan(`Selected Story ID: ${storyId}`));
    } catch (error) {
      logError('Failed to get stories', error);
      return;
    }

    // 3. Get chapters for the selected story to find a chapter ID
    try {
      console.log(chalk.cyan('\nFetching chapters...'));
      const chaptersResponse = await axios.get(`${API_URL}/stories/${storyId}/chapters`);
      if (chaptersResponse.data.data.chapters.length > 0) {
        chapterId = chaptersResponse.data.data.chapters[0].id;
        logResponse('Got Chapters', chaptersResponse);
        console.log(chalk.cyan(`Selected Chapter ID: ${chapterId}`));
      } else {
        console.log(chalk.yellow('No chapters found for this story. Some tests will be skipped.'));
      }
    } catch (error) {
      logError('Failed to get chapters', error);
      console.log(chalk.yellow('Some tests will be skipped.'));
    }

    // 4. Manually record reading history
    try {
      console.log(chalk.cyan('\nRecording reading history...'));
      const recordData = {
        storyId,
        progress: 25,
        currentChapterNumber: 1
      };
      
      if (chapterId) {
        recordData.chapterId = chapterId;
      }
      
      const recordResponse = await axios.post(`${API_URL}/reading-history`, recordData);
      logResponse('Recorded Reading History', recordResponse);
    } catch (error) {
      logError('Failed to record reading history', error);
    }

    // 5. Get user's reading history
    try {
      console.log(chalk.cyan('\nFetching reading history...'));
      const historyResponse = await axios.get(`${API_URL}/reading-history`);
      logResponse('Got Reading History', historyResponse);
    } catch (error) {
      logError('Failed to get reading history', error);
    }

    // 6. Get reading history with pagination
    try {
      console.log(chalk.cyan('\nFetching reading history with pagination...'));
      const paginatedResponse = await axios.get(`${API_URL}/reading-history?page=1&limit=5`);
      logResponse('Got Paginated Reading History', paginatedResponse);
    } catch (error) {
      logError('Failed to get paginated reading history', error);
    }

    // 7. Get reading history for a specific story
    try {
      console.log(chalk.cyan('\nFetching reading history for specific story...'));
      const storyHistoryResponse = await axios.get(`${API_URL}/reading-history/story/${storyId}`);
      logResponse('Got Story Reading History', storyHistoryResponse);
    } catch (error) {
      logError('Failed to get story reading history', error);
    }

    // 8. Update reading history with new progress
    try {
      console.log(chalk.cyan('\nUpdating reading history...'));
      const updateData = {
        storyId,
        progress: 50,
        currentChapterNumber: 2
      };
      
      if (chapterId) {
        updateData.chapterId = chapterId;
      }
      
      const updateResponse = await axios.post(`${API_URL}/reading-history`, updateData);
      logResponse('Updated Reading History', updateResponse);
    } catch (error) {
      logError('Failed to update reading history', error);
    }

    // 9. Verify reading history is automatically recorded when viewing a story
    try {
      console.log(chalk.cyan('\nViewing a story to test automatic recording...'));
      const viewStoryResponse = await axios.get(`${API_URL}/stories/${storyId}`);
      logResponse('Viewed Story', viewStoryResponse);
      
      // Check if reading history was updated
      console.log(chalk.cyan('\nChecking if reading history was automatically updated...'));
      const autoHistoryResponse = await axios.get(`${API_URL}/reading-history/story/${storyId}`);
      logResponse('Auto-Updated Reading History', autoHistoryResponse);
    } catch (error) {
      logError('Failed during automatic story recording test', error);
    }

    // 10. Verify reading history is automatically recorded when reading a chapter
    if (chapterId) {
      try {
        console.log(chalk.cyan('\nViewing a chapter to test automatic recording...'));
        const viewChapterResponse = await axios.get(`${API_URL}/chapters/${chapterId}`);
        logResponse('Viewed Chapter', viewChapterResponse);
        
        // Check if reading history was updated
        console.log(chalk.cyan('\nChecking if reading history was automatically updated...'));
        const autoChapterHistoryResponse = await axios.get(`${API_URL}/reading-history/story/${storyId}`);
        logResponse('Auto-Updated Reading History (Chapter)', autoChapterHistoryResponse);
      } catch (error) {
        logError('Failed during automatic chapter recording test', error);
      }
    }

    // 11. Delete reading history for a specific story
    try {
      console.log(chalk.cyan('\nDeleting reading history for specific story...'));
      const deleteResponse = await axios.delete(`${API_URL}/reading-history/story/${storyId}`);
      logResponse('Deleted Story Reading History', deleteResponse);
      
      // Verify deletion
      try {
        await axios.get(`${API_URL}/reading-history/story/${storyId}`);
      } catch (error) {
        console.log(chalk.green('Verified: Reading history was successfully deleted'));
      }
    } catch (error) {
      logError('Failed to delete reading history', error);
    }

    // 12. Record reading history again for testing clear all
    try {
      console.log(chalk.cyan('\nRecording reading history again...'));
      await axios.post(`${API_URL}/reading-history`, { storyId, progress: 10 });
    } catch (error) {
      logError('Failed to record reading history again', error);
    }

    // 13. Clear all reading history
    try {
      console.log(chalk.cyan('\nClearing all reading history...'));
      const clearResponse = await axios.delete(`${API_URL}/reading-history`);
      logResponse('Cleared All Reading History', clearResponse);
      
      // Verify clearing
      const verifyResponse = await axios.get(`${API_URL}/reading-history`);
      if (verifyResponse.data.data.readingHistory.length === 0) {
        console.log(chalk.green('Verified: All reading history was successfully cleared'));
      } else {
        console.log(chalk.yellow('Warning: Reading history may not have been fully cleared'));
      }
    } catch (error) {
      logError('Failed to clear reading history', error);
    }

    console.log(chalk.bold.green('\n✅ Reading History API Tests Completed'));
  } catch (error) {
    console.log(chalk.bold.red('\n❌ Test execution failed'));
    console.error(error);
  }
};

// Run the tests
runTests();
