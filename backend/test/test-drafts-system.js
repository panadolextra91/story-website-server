/**
 * Drafts System API Test Script
 * 
 * This script tests the drafts system API endpoints
 * Run with: node test/test-drafts-system.js
 */

const axios = require('axios');

// Simple color functions for console output
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

// Configuration
const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Global variables to store data between requests
let authToken;
let userId;
let storyDraftId;
let chapterDraftId;
let storyId;
let categoryId;

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
    console.log(chalk.bold.yellow('\n🚀 Starting Drafts System API Tests'));

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

    // 2. Get categories for story creation
    try {
      console.log(chalk.cyan('\nGetting categories...'));
      const categoriesResponse = await axios.get(`${API_URL}/categories`);
      logResponse('Got Categories', categoriesResponse);
      categoryId = categoriesResponse.data.data.categories[0].id;
      console.log(chalk.cyan(`Selected Category ID: ${categoryId}`));
    } catch (error) {
      logError('Failed to get categories', error);
    }

    // 3. Create a story draft
    try {
      console.log(chalk.cyan('\nCreating a story draft...'));
      const storyDraftData = {
        title: 'My Draft Story',
        content: 'This is the content of my draft story.',
        description: 'This is a test story draft.',
        coverImage: 'https://example.com/image.jpg'
      };
      
      const storyDraftResponse = await axios.post(`${API_URL}/drafts/story`, storyDraftData);
      logResponse('Created Story Draft', storyDraftResponse);
      storyDraftId = storyDraftResponse.data.data.draft.id;
      console.log(chalk.cyan(`Story Draft ID: ${storyDraftId}`));
    } catch (error) {
      logError('Failed to create story draft', error);
      return;
    }

    // 4. Get all drafts
    try {
      console.log(chalk.cyan('\nGetting all drafts...'));
      const draftsResponse = await axios.get(`${API_URL}/drafts`);
      logResponse('Got All Drafts', draftsResponse);
    } catch (error) {
      logError('Failed to get drafts', error);
    }

    // 5. Get story drafts only
    try {
      console.log(chalk.cyan('\nGetting story drafts...'));
      const storyDraftsResponse = await axios.get(`${API_URL}/drafts?type=STORY`);
      logResponse('Got Story Drafts', storyDraftsResponse);
    } catch (error) {
      logError('Failed to get story drafts', error);
    }

    // 6. Get a specific draft by ID
    try {
      console.log(chalk.cyan('\nGetting a specific draft...'));
      const draftResponse = await axios.get(`${API_URL}/drafts/${storyDraftId}`);
      logResponse('Got Draft by ID', draftResponse);
    } catch (error) {
      logError('Failed to get draft by ID', error);
    }

    // 7. Update a draft
    try {
      console.log(chalk.cyan('\nUpdating a draft...'));
      const updateData = {
        title: 'Updated Draft Story',
        description: 'This is an updated test story draft.'
      };
      
      const updateResponse = await axios.patch(`${API_URL}/drafts/${storyDraftId}`, updateData);
      logResponse('Updated Draft', updateResponse);
    } catch (error) {
      logError('Failed to update draft', error);
    }

    // 8. Publish a story draft
    try {
      console.log(chalk.cyan('\nPublishing a story draft...'));
      const publishData = {
        categoryIds: [categoryId]
      };
      
      const publishResponse = await axios.post(`${API_URL}/drafts/${storyDraftId}/publish-story`, publishData);
      logResponse('Published Story Draft', publishResponse);
      storyId = publishResponse.data.data.story.id;
      console.log(chalk.cyan(`Published Story ID: ${storyId}`));
    } catch (error) {
      logError('Failed to publish story draft', error);
      
      // If the draft was already published, we need to get a story ID for the next tests
      try {
        const storiesResponse = await axios.get(`${API_URL}/stories`);
        storyId = storiesResponse.data.data.stories[0].id;
        console.log(chalk.cyan(`Selected existing Story ID: ${storyId}`));
      } catch (innerError) {
        console.log(chalk.red('Could not get a story ID, chapter draft tests will fail.'));
        return;
      }
    }

    // 9. Create a chapter draft
    try {
      console.log(chalk.cyan('\nCreating a chapter draft...'));
      const chapterDraftData = {
        title: 'My Draft Chapter',
        content: 'This is the content of my draft chapter.',
        storyId
      };
      
      const chapterDraftResponse = await axios.post(`${API_URL}/drafts/chapter`, chapterDraftData);
      logResponse('Created Chapter Draft', chapterDraftResponse);
      chapterDraftId = chapterDraftResponse.data.data.draft.id;
      console.log(chalk.cyan(`Chapter Draft ID: ${chapterDraftId}`));
    } catch (error) {
      logError('Failed to create chapter draft', error);
      return;
    }

    // 10. Get chapter drafts only
    try {
      console.log(chalk.cyan('\nGetting chapter drafts...'));
      const chapterDraftsResponse = await axios.get(`${API_URL}/drafts?type=CHAPTER`);
      logResponse('Got Chapter Drafts', chapterDraftsResponse);
    } catch (error) {
      logError('Failed to get chapter drafts', error);
    }

    // 11. Update a chapter draft
    try {
      console.log(chalk.cyan('\nUpdating a chapter draft...'));
      const updateChapterData = {
        title: 'Updated Draft Chapter',
        content: 'This is the updated content of my draft chapter.'
      };
      
      const updateChapterResponse = await axios.patch(`${API_URL}/drafts/${chapterDraftId}`, updateChapterData);
      logResponse('Updated Chapter Draft', updateChapterResponse);
    } catch (error) {
      logError('Failed to update chapter draft', error);
    }

    // 12. Publish a chapter draft
    try {
      console.log(chalk.cyan('\nPublishing a chapter draft...'));
      const publishChapterResponse = await axios.post(`${API_URL}/drafts/${chapterDraftId}/publish-chapter`);
      logResponse('Published Chapter Draft', publishChapterResponse);
    } catch (error) {
      logError('Failed to publish chapter draft', error);
    }

    // 13. Create another draft for deletion test
    try {
      console.log(chalk.cyan('\nCreating another draft for deletion test...'));
      const deletionDraftData = {
        title: 'Draft to Delete',
        content: 'This draft will be deleted.'
      };
      
      const deletionDraftResponse = await axios.post(`${API_URL}/drafts/story`, deletionDraftData);
      logResponse('Created Draft for Deletion', deletionDraftResponse);
      const deletionDraftId = deletionDraftResponse.data.data.draft.id;
      
      // 14. Delete a draft
      try {
        console.log(chalk.cyan('\nDeleting a draft...'));
        const deleteResponse = await axios.delete(`${API_URL}/drafts/${deletionDraftId}`);
        logResponse('Deleted Draft', deleteResponse);
        
        // Verify deletion
        try {
          await axios.get(`${API_URL}/drafts/${deletionDraftId}`);
          console.log(chalk.red('Deletion verification failed! Draft still exists.'));
        } catch (verifyError) {
          console.log(chalk.green('Deletion verification successful! Draft was deleted.'));
        }
      } catch (deleteError) {
        logError('Failed to delete draft', deleteError);
      }
    } catch (error) {
      logError('Failed to create draft for deletion test', error);
    }

    console.log(chalk.bold.green('\n✅ Drafts System API Tests Completed'));
  } catch (error) {
    console.log(chalk.bold.red('\n❌ Test execution failed'));
    console.error(error);
  }
};

// Run the tests
runTests();
