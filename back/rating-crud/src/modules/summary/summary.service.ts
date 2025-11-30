import * as summaryRepository from './summary.repository.js';
import * as buildingService from '../building/building.service.js';
import type { Summary, UpdateSummaryInput } from './summary.types.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function getByBuildingId(buildingId: string): Promise<Summary | null> {
  return summaryRepository.findByBuildingId(buildingId);
}

export async function update(buildingId: string, input: UpdateSummaryInput): Promise<Summary> {
  const buildingExists = await buildingService.exists(buildingId);
  if (!buildingExists) {
    throw new NotFoundError(`Building not found: ${buildingId}`);
  }

  if (input.averageRating < 0 || input.averageRating > 5) {
    throw new ValidationError('Average rating must be between 0 and 5');
  }

  if (input.commentCount < 0) {
    throw new ValidationError('Comment count cannot be negative');
  }

  return summaryRepository.upsert(buildingId, input);
}
