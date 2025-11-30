import express, { type Request, type Response, type NextFunction } from 'express';
import { buildingRouter } from './modules/building/building.controller.js';
import { commentRouter } from './modules/comment/comment.controller.js';
import { summaryRouter } from './modules/summary/summary.controller.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/buildings', buildingRouter);
  app.use('/api/buildings/:buildingId/comments', commentRouter);
  app.use('/api/summaries', summaryRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
