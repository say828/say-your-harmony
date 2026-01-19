/**
 * Application entry point
 */

import { createApp } from './app';
import { initializeDatabase, closeDatabase } from './db/database';

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    // Initialize database
    console.log('Initializing database...');
    initializeDatabase();
    console.log('Database initialized successfully');

    // Create and start Express app
    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoints: http://localhost:${PORT}/todos`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        closeDatabase();
        console.log('Database connection closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\nShutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        closeDatabase();
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
start();
