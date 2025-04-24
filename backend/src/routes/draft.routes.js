const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getUserDrafts,
  getDraftById,
  createStoryDraft,
  createChapterDraft,
  updateDraft,
  deleteDraft,
  publishStoryDraft,
  publishChapterDraft
} = require('../controllers/draft.controller');

// All routes require authentication
router.use(protect);

// Get all drafts for the current user
router.get('/', getUserDrafts);

// Get a draft by ID
router.get('/:id', getDraftById);

// Create a new story draft
router.post('/story', createStoryDraft);

// Create a new chapter draft
router.post('/chapter', createChapterDraft);

// Update a draft
router.patch('/:id', updateDraft);

// Delete a draft
router.delete('/:id', deleteDraft);

// Publish a story draft
router.post('/:id/publish-story', publishStoryDraft);

// Publish a chapter draft
router.post('/:id/publish-chapter', publishChapterDraft);

module.exports = router;
