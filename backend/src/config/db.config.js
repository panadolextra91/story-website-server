const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Connect to the database
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    return prisma;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

module.exports = {
  prisma,
  connectDB
};
