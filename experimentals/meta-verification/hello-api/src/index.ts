import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// Single endpoint: GET /hello
app.get('/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello, World!' });
});

// Export app for testing
export { app };

// Start server only when run directly (not imported for tests)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Hello API running on http://localhost:${PORT}`);
  });
}
