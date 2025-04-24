/**
 * User Preferences API Test Script
 * 
 * This script tests the user preferences API endpoints
 * Run with: node test/test-user-preferences.js
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

// Configuration - MODIFY THESE VALUES WITH YOUR ACTUAL CREDENTIALS
const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Global variables to store data between requests
let authToken;
let userId;

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
    console.log(chalk.bold.yellow('\n🚀 Starting User Preferences API Tests'));

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

    // 2. Get user preferences (should create default preferences if they don't exist)
    try {
      console.log(chalk.cyan('\nGetting user preferences...'));
      const preferencesResponse = await axios.get(`${API_URL}/preferences`);
      logResponse('Got User Preferences', preferencesResponse);
    } catch (error) {
      logError('Failed to get user preferences', error);
      return;
    }

    // 3. Update user preferences - change font family
    try {
      console.log(chalk.cyan('\nUpdating font family to Times New Roman...'));
      const updateFontResponse = await axios.patch(`${API_URL}/preferences`, {
        fontFamily: 'Times New Roman'
      });
      logResponse('Updated Font Family', updateFontResponse);
    } catch (error) {
      logError('Failed to update font family', error);
    }

    // 4. Update user preferences - change font size
    try {
      console.log(chalk.cyan('\nUpdating font size to 20...'));
      const updateSizeResponse = await axios.patch(`${API_URL}/preferences`, {
        fontSize: 20
      });
      logResponse('Updated Font Size', updateSizeResponse);
    } catch (error) {
      logError('Failed to update font size', error);
    }

    // 5. Update user preferences - change theme
    try {
      console.log(chalk.cyan('\nUpdating theme to dark...'));
      const updateThemeResponse = await axios.patch(`${API_URL}/preferences`, {
        theme: 'dark'
      });
      logResponse('Updated Theme', updateThemeResponse);
    } catch (error) {
      logError('Failed to update theme', error);
    }

    // 6. Update multiple preferences at once
    try {
      console.log(chalk.cyan('\nUpdating multiple preferences at once...'));
      const updateMultipleResponse = await axios.patch(`${API_URL}/preferences`, {
        fontFamily: 'Roboto',
        fontSize: 18,
        theme: 'light'
      });
      logResponse('Updated Multiple Preferences', updateMultipleResponse);
    } catch (error) {
      logError('Failed to update multiple preferences', error);
    }

    // 7. Test validation - invalid font family
    try {
      console.log(chalk.cyan('\nTesting validation - invalid font family...'));
      await axios.patch(`${API_URL}/preferences`, {
        fontFamily: 'Comic Sans'
      });
      console.log(chalk.red('Validation failed! Invalid font family was accepted.'));
    } catch (error) {
      console.log(chalk.green('Validation successful! Invalid font family was rejected.'));
      if (error.response) {
        console.log(chalk.green('Error message:'), error.response.data.message);
      }
    }

    // 8. Test validation - invalid font size
    try {
      console.log(chalk.cyan('\nTesting validation - invalid font size...'));
      await axios.patch(`${API_URL}/preferences`, {
        fontSize: 50
      });
      console.log(chalk.red('Validation failed! Invalid font size was accepted.'));
    } catch (error) {
      console.log(chalk.green('Validation successful! Invalid font size was rejected.'));
      if (error.response) {
        console.log(chalk.green('Error message:'), error.response.data.message);
      }
    }

    // 9. Test validation - invalid theme
    try {
      console.log(chalk.cyan('\nTesting validation - invalid theme...'));
      await axios.patch(`${API_URL}/preferences`, {
        theme: 'blue'
      });
      console.log(chalk.red('Validation failed! Invalid theme was accepted.'));
    } catch (error) {
      console.log(chalk.green('Validation successful! Invalid theme was rejected.'));
      if (error.response) {
        console.log(chalk.green('Error message:'), error.response.data.message);
      }
    }

    // 10. Reset preferences to defaults
    try {
      console.log(chalk.cyan('\nResetting preferences to defaults...'));
      const resetResponse = await axios.delete(`${API_URL}/preferences/reset`);
      logResponse('Reset Preferences', resetResponse);
      
      // Verify reset
      const verifyResponse = await axios.get(`${API_URL}/preferences`);
      logResponse('Verified Reset', verifyResponse);
      
      const preferences = verifyResponse.data.data.preferences;
      if (
        preferences.fontFamily === 'Arial' && 
        preferences.fontSize === 16 && 
        preferences.theme === 'light'
      ) {
        console.log(chalk.green('Preferences were successfully reset to defaults!'));
      } else {
        console.log(chalk.yellow('Warning: Preferences may not have been fully reset.'));
      }
    } catch (error) {
      logError('Failed to reset preferences', error);
    }

    console.log(chalk.bold.green('\n✅ User Preferences API Tests Completed'));
  } catch (error) {
    console.log(chalk.bold.red('\n❌ Test execution failed'));
    console.error(error);
  }
};

// Run the tests
runTests();
