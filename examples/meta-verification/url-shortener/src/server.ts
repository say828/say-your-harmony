/**
 * Express.js server setup
 */

import express from 'express';
import { urlRouter } from './routes/url.routes.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/', urlRouter);

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`URL Shortener API running on http://localhost:${PORT}`);
  });
}

// Export for testing
export { app };
