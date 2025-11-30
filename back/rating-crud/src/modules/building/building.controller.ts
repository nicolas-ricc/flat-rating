import { Router, type Request, type Response } from 'express';
import * as buildingService from './building.service.js';
import { ValidationError, NotFoundError } from './building.service.js';

const router = Router();

// GET /api/buildings
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    const buildings = await buildingService.list({ search, limit, offset });
    res.json(buildings);
  } catch (error) {
    console.error('Error listing buildings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/buildings/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const building = await buildingService.getById(req.params.id);
    res.json(building);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/buildings
router.post('/', async (req: Request, res: Response) => {
  try {
    const building = await buildingService.create(req.body);
    res.status(201).json(building);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error creating building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const buildingRouter = router;
