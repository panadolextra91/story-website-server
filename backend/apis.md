# Story Reading Application API Documentation

This document provides a comprehensive list of all API endpoints available in the Story Reading application, along with brief descriptions and testing instructions for Postman.

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Stories](#stories)
4. [Chapters](#chapters)
5. [Categories](#categories)
6. [Comments](#comments)
7. [Follows](#follows)
8. [Reading History](#reading-history)
9. [User Preferences](#user-preferences)
10. [Drafts](#drafts)

---

## Authentication

### Register a new user
- **Endpoint**: `POST /api/auth/register`
- **Description**: Creates a new user account
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/auth/register`
  - Body (JSON):
    ```json
    {
      "username": "testuser",
      "email": "test@example.com",
      "password": "password123"
    }
    ```

### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns a JWT token
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/auth/login`
  - Body (JSON):
    ```json
    {
      "email": "admin@example.com",
      "password": "admin123"
    }
    ```
    or
    ```json
    {
      "email": "test@ex.com",
      "password": "test123"
    }
    ```

### Get current user
- **Endpoint**: `GET /api/auth/me`
- **Description**: Returns the currently authenticated user's information
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/auth/me`
  - Headers: `Authorization: Bearer {{token}}`

### Refresh token
- **Endpoint**: `POST /api/auth/refresh-token`
- **Description**: Refreshes the JWT token using a refresh token
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/auth/refresh-token`
  - Body (JSON):
    ```json
    {
      "refreshToken": "{{refreshToken}}"
    }
    ```

---

## Users

### Get all users
- **Endpoint**: `GET /api/users`
- **Description**: Returns a list of all users with pagination
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/users?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Get user by ID
- **Endpoint**: `GET /api/users/:id`
- **Description**: Returns a specific user by ID
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/users/{{userId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Update user
- **Endpoint**: `PATCH /api/users/:id`
- **Description**: Updates a user's information
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/users/{{userId}}`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (form-data):
    - `username`: "updatedUsername"
    - `bio`: "Updated bio"
    - `profilePicture`: [file upload]

### Delete user
- **Endpoint**: `DELETE /api/users/:id`
- **Description**: Deletes a user account
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/users/{{userId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Get user stories
- **Endpoint**: `GET /api/users/:id/stories`
- **Description**: Returns all stories written by a specific user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/users/{{userId}}/stories?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Get user bookmarks
- **Endpoint**: `GET /api/users/:id/bookmarks`
- **Description**: Returns all stories bookmarked by a specific user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/users/{{userId}}/bookmarks?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

---

## Stories

### Get all stories
- **Endpoint**: `GET /api/stories`
- **Description**: Returns a list of all stories with filtering and pagination
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/stories?page=1&limit=10&category=Fantasy&status=PUBLISHED`
  - Headers: `Authorization: Bearer {{token}}`

### Search stories
- **Endpoint**: `GET /api/stories/search`
- **Description**: Searches for stories by title
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/stories/search?query=adventure&page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Get story by ID
- **Endpoint**: `GET /api/stories/:id`
- **Description**: Returns a specific story by ID
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/stories/{{storyId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Create story
- **Endpoint**: `POST /api/stories`
- **Description**: Creates a new story
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/stories`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (form-data):
    - `title`: "My New Story"
    - `description`: "Story description"
    - `categoryIds`: ["{{categoryId1}}", "{{categoryId2}}"]
    - `coverImage`: [file upload]

### Update story
- **Endpoint**: `PATCH /api/stories/:id`
- **Description**: Updates a story
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/stories/{{storyId}}`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (form-data):
    - `title`: "Updated Story Title"
    - `description`: "Updated description"
    - `status`: "PUBLISHED"
    - `coverImage`: [file upload]

### Delete story
- **Endpoint**: `DELETE /api/stories/:id`
- **Description**: Deletes a story
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/stories/{{storyId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Get story chapters
- **Endpoint**: `GET /api/stories/:id/chapters`
- **Description**: Returns all chapters for a specific story
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/stories/{{storyId}}/chapters?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Create chapter
- **Endpoint**: `POST /api/stories/:id/chapters`
- **Description**: Creates a new chapter for a story
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/stories/{{storyId}}/chapters`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "title": "Chapter 1",
      "content": "Chapter content goes here",
      "chapterNumber": 1
    }
    ```

### Get story ratings
- **Endpoint**: `GET /api/stories/:id/ratings`
- **Description**: Returns all ratings for a specific story
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/stories/{{storyId}}/ratings?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Rate story
- **Endpoint**: `POST /api/stories/:id/rate`
- **Description**: Rates a story
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/stories/{{storyId}}/rate`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "rating": 5,
      "review": "Great story!"
    }
    ```

### Bookmark story
- **Endpoint**: `POST /api/stories/:id/bookmark`
- **Description**: Bookmarks a story
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/stories/{{storyId}}/bookmark`
  - Headers: `Authorization: Bearer {{token}}`

### Remove bookmark
- **Endpoint**: `DELETE /api/stories/:id/bookmark`
- **Description**: Removes a bookmark from a story
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/stories/{{storyId}}/bookmark`
  - Headers: `Authorization: Bearer {{token}}`

### Get story view statistics
- **Endpoint**: `GET /api/stories/:id/stats`
- **Description**: Returns view statistics for a story
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/stories/{{storyId}}/stats`
  - Headers: `Authorization: Bearer {{token}}`

---

## Chapters

### Get chapter by ID
- **Endpoint**: `GET /api/chapters/:id`
- **Description**: Returns a specific chapter by ID
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/chapters/{{chapterId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Update chapter
- **Endpoint**: `PATCH /api/chapters/:id`
- **Description**: Updates a chapter
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/chapters/{{chapterId}}`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "title": "Updated Chapter Title",
      "content": "Updated chapter content"
    }
    ```

### Delete chapter
- **Endpoint**: `DELETE /api/chapters/:id`
- **Description**: Deletes a chapter
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/chapters/{{chapterId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Get chapter comments
- **Endpoint**: `GET /api/chapters/:id/comments`
- **Description**: Returns all comments for a specific chapter
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/chapters/{{chapterId}}/comments?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Add comment to chapter
- **Endpoint**: `POST /api/chapters/:id/comments`
- **Description**: Adds a comment to a chapter
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/chapters/{{chapterId}}/comments`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "content": "This is a comment"
    }
    ```

---

## Categories

### Get all categories
- **Endpoint**: `GET /api/categories`
- **Description**: Returns a list of all categories
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/categories`
  - Headers: `Authorization: Bearer {{token}}`

### Get category by ID
- **Endpoint**: `GET /api/categories/:id`
- **Description**: Returns a specific category by ID
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/categories/{{categoryId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Create category
- **Endpoint**: `POST /api/categories`
- **Description**: Creates a new category (admin only)
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/categories`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "name": "New Category",
      "description": "Category description"
    }
    ```

### Update category
- **Endpoint**: `PATCH /api/categories/:id`
- **Description**: Updates a category (admin only)
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/categories/{{categoryId}}`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "name": "Updated Category",
      "description": "Updated description"
    }
    ```

### Delete category
- **Endpoint**: `DELETE /api/categories/:id`
- **Description**: Deletes a category (admin only)
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/categories/{{categoryId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Get category stories
- **Endpoint**: `GET /api/categories/:id/stories`
- **Description**: Returns all stories in a specific category
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/categories/{{categoryId}}/stories?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

---

## Comments

### Update comment
- **Endpoint**: `PATCH /api/comments/:id`
- **Description**: Updates a comment
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/comments/{{commentId}}`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "content": "Updated comment"
    }
    ```

### Delete comment
- **Endpoint**: `DELETE /api/comments/:id`
- **Description**: Deletes a comment
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/comments/{{commentId}}`
  - Headers: `Authorization: Bearer {{token}}`

---

## Follows

### Follow a user
- **Endpoint**: `POST /api/follows/:id`
- **Description**: Follows a user
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/follows/{{userId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Unfollow a user
- **Endpoint**: `DELETE /api/follows/:id`
- **Description**: Unfollows a user
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/follows/{{userId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Get followers
- **Endpoint**: `GET /api/follows/:id/followers`
- **Description**: Returns all followers of a user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/follows/{{userId}}/followers?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Get following
- **Endpoint**: `GET /api/follows/:id/following`
- **Description**: Returns all users followed by a user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/follows/{{userId}}/following?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Check follow status
- **Endpoint**: `GET /api/follows/check/:id`
- **Description**: Checks if the current user is following another user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/follows/check/{{userId}}`
  - Headers: `Authorization: Bearer {{token}}`

---

## Reading History

### Record reading history
- **Endpoint**: `POST /api/reading-history`
- **Description**: Records or updates reading history for a story
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/reading-history`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "storyId": "{{storyId}}",
      "chapterId": "{{chapterId}}",
      "progress": 50,
      "currentChapterNumber": 2
    }
    ```

### Get user reading history
- **Endpoint**: `GET /api/reading-history`
- **Description**: Returns the reading history for the current user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/reading-history?page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Get reading history for a story
- **Endpoint**: `GET /api/reading-history/story/:storyId`
- **Description**: Returns the reading history for a specific story
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/reading-history/story/{{storyId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Delete reading history for a story
- **Endpoint**: `DELETE /api/reading-history/story/:storyId`
- **Description**: Deletes the reading history for a specific story
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/reading-history/story/{{storyId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Clear all reading history
- **Endpoint**: `DELETE /api/reading-history`
- **Description**: Clears all reading history for the current user
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/reading-history`
  - Headers: `Authorization: Bearer {{token}}`

---

## User Preferences

### Get user preferences
- **Endpoint**: `GET /api/preferences`
- **Description**: Returns the preferences for the current user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/preferences`
  - Headers: `Authorization: Bearer {{token}}`

### Update user preferences
- **Endpoint**: `PATCH /api/preferences`
- **Description**: Updates the preferences for the current user
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/preferences`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "fontFamily": "Times New Roman",
      "fontSize": 18,
      "theme": "dark"
    }
    ```

### Reset user preferences
- **Endpoint**: `DELETE /api/preferences/reset`
- **Description**: Resets the preferences for the current user to defaults
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/preferences/reset`
  - Headers: `Authorization: Bearer {{token}}`

---

## Drafts

### Get all drafts
- **Endpoint**: `GET /api/drafts`
- **Description**: Returns all drafts for the current user
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/drafts?type=STORY&page=1&limit=10`
  - Headers: `Authorization: Bearer {{token}}`

### Get draft by ID
- **Endpoint**: `GET /api/drafts/:id`
- **Description**: Returns a specific draft by ID
- **Postman Test**:
  - Method: GET
  - URL: `{{baseUrl}}/drafts/{{draftId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Create story draft
- **Endpoint**: `POST /api/drafts/story`
- **Description**: Creates a new story draft
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/drafts/story`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "title": "My Draft Story",
      "content": "Draft content",
      "description": "Draft description",
      "coverImage": "https://example.com/image.jpg"
    }
    ```

### Create chapter draft
- **Endpoint**: `POST /api/drafts/chapter`
- **Description**: Creates a new chapter draft
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/drafts/chapter`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "title": "My Draft Chapter",
      "content": "Draft content",
      "storyId": "{{storyId}}",
      "chapterNumber": 1
    }
    ```

### Update draft
- **Endpoint**: `PATCH /api/drafts/:id`
- **Description**: Updates a draft
- **Postman Test**:
  - Method: PATCH
  - URL: `{{baseUrl}}/drafts/{{draftId}}`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "title": "Updated Draft Title",
      "content": "Updated draft content"
    }
    ```

### Delete draft
- **Endpoint**: `DELETE /api/drafts/:id`
- **Description**: Deletes a draft
- **Postman Test**:
  - Method: DELETE
  - URL: `{{baseUrl}}/drafts/{{draftId}}`
  - Headers: `Authorization: Bearer {{token}}`

### Publish story draft
- **Endpoint**: `POST /api/drafts/:id/publish-story`
- **Description**: Publishes a story draft
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/drafts/{{draftId}}/publish-story`
  - Headers: `Authorization: Bearer {{token}}`
  - Body (JSON):
    ```json
    {
      "categoryIds": ["{{categoryId1}}", "{{categoryId2}}"]
    }
    ```

### Publish chapter draft
- **Endpoint**: `POST /api/drafts/:id/publish-chapter`
- **Description**: Publishes a chapter draft
- **Postman Test**:
  - Method: POST
  - URL: `{{baseUrl}}/drafts/{{draftId}}/publish-chapter`
  - Headers: `Authorization: Bearer {{token}}`

---

## Postman Setup Instructions

1. **Create Environment Variables**:
   - Create a new environment in Postman
   - Add the following variables:
     - `baseUrl`: `http://localhost:3000/api`
     - `token`: (empty initially, will be set after login)
     - `refreshToken`: (empty initially, will be set after login)
     - `userId`: (empty initially, will be set after login)
     - `storyId`: (empty initially, will be set after creating a story)
     - `chapterId`: (empty initially, will be set after creating a chapter)
     - `categoryId`: (empty initially, will be set after getting categories)
     - `commentId`: (empty initially, will be set after creating a comment)
     - `draftId`: (empty initially, will be set after creating a draft)

2. **Set Token Automatically**:
   - In the login request, add the following test script:
     ```javascript
     if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.data.token);
       pm.environment.set("refreshToken", jsonData.data.refreshToken);
       pm.environment.set("userId", jsonData.data.user.id);
     }
     ```

3. **Test Flow**:
   - First, register a new user or login with existing credentials
   - The token will be automatically set in the environment
   - You can now test all other endpoints using the token for authentication

4. **Collection Runner**:
   - Create a collection with all the requests
   - Use the Collection Runner to run all requests in sequence
   - This will help test the entire API flow

---

## Notes

- All endpoints except for authentication require a valid JWT token in the Authorization header
- Pagination is available for most list endpoints using `page` and `limit` query parameters
- Some endpoints require specific roles (e.g., admin) to access
- File uploads should be sent as form-data
- The API returns standardized responses with the following structure:
  ```json
  {
    "status": "success",
    "data": { ... }
  }
  ```
  or for errors:
  ```json
  {
    "status": "error",
    "statusCode": 400,
    "message": "Error message"
  }
  ```
