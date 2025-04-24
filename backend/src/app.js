const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { corsOptions } = require('./middlewares/cors.middleware');
const { errorHandler } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const storyRoutes = require('./routes/story.routes');
const categoryRoutes = require('./routes/category.routes');
const chapterRoutes = require('./routes/chapter.routes');
const commentRoutes = require('./routes/comment.routes');
const followRoutes = require('./routes/follow.routes');
const readingHistoryRoutes = require('./routes/reading-history.routes');
const preferenceRoutes = require('./routes/preference.routes');
const draftRoutes = require('./routes/draft.routes');

// Create Express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/reading-history', readingHistoryRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/drafts', draftRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
