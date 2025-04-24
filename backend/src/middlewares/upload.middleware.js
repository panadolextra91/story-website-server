const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const config = require('../config/app.config');
const { AppError } = require('./error.middleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Create storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'story-reading',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Create storage engine for local uploads (for development or fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage, // Always use Cloudinary storage regardless of environment
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware for uploading profile pictures
const uploadProfilePicture = upload.single('profilePicture');

// Middleware for uploading story cover images
const uploadStoryCover = upload.single('coverImage');

module.exports = {
  uploadProfilePicture,
  uploadStoryCover,
  cloudinary
};
