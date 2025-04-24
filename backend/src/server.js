const app = require('./app');
const { connectDB } = require('./config/db.config');
const config = require('./config/app.config');

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`Server running in ${config.env} mode on port ${config.port}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
    
    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      console.log('SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('Process terminated!');
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
