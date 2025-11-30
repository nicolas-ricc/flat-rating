import { Router, type Request, type Response } from 'express';
import * as summaryService from './summary.service.js';
import { ValidationError, NotFoundError } from './summary.service.js';

const router = Router();

// PUT /api/summaries/:buildingId
router.put('/:buildingId', async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const summary = await summaryService.update(buildingId, req.body);
    res.json(summary);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error updating summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/summaries/:buildingId (optional, for debugging)
router.get('/:buildingId', async (req: Request, res: Response) => {
  try {
    const { buildingId } = req.params;
    const summary = await summaryService.getByBuildingId(buildingId);
    if (!summary) {
      res.status(404).json({ error: 'Summary not found' });
      return;
    }
    res.json(summary);
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const summaryRouter = router;
