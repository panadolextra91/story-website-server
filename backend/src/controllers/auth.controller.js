const { prisma } = require('../config/db.config');
const { AppError } = require('../middlewares/error.middleware');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return next(new AppError('User with this email or username already exists', 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER' // Default role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profilePicture: true,
        bio: true,
        createdAt: true
      }
    });

    // Generate tokens
    const token = generateToken({ id: newUser.id });
    const refreshToken = generateRefreshToken({ id: newUser.id });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if password is correct
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate tokens
    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true }
    });

    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new tokens
    const newToken = generateToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid refresh token', 401));
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken
};
