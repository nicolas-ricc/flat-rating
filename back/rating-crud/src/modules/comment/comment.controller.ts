import { Router, type Request, type Response } from 'express';
import * as commentService from './comment.service.js';
import { ValidationError, NotFoundError } from './comment.service.js';

const router = Router({ mergeParams: true });

// GET /api/buildings/:buildingId/comments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    const comments = await commentService.listByBuildingId(buildingId, { limit, offset });
    res.json(comments);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error listing comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/buildings/:buildingId/comments
router.post('/', async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const comment = await commentService.create(buildingId, req.body);
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const commentRouter = router;
