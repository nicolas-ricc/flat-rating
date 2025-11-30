import * as commentRepository from './comment.repository.js';
import * as buildingService from '../building/building.service.js';
import { eventBus, EventTypes } from '../../infrastructure/events/event-bus.js';
import type { Comment, CreateCommentInput, ListCommentsQuery } from './comment.types.js';

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

export async function listByBuildingId(
  buildingId: string,
  query: ListCommentsQuery
): Promise<Comment[]> {
  const buildingExists = await buildingService.exists(buildingId);
  if (!buildingExists) {
    throw new NotFoundError(`Building not found: ${buildingId}`);
  }

  return commentRepository.findByBuildingId(buildingId, query);
}

export async function create(
  buildingId: string,
  input: CreateCommentInput
): Promise<Comment> {
  const buildingExists = await buildingService.exists(buildingId);
  if (!buildingExists) {
    throw new NotFoundError(`Building not found: ${buildingId}`);
  }

  if (!input.content || input.content.trim().length === 0) {
    throw new ValidationError('Comment content is required');
  }

  if (!input.rating || input.rating < 1 || input.rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  const comment = await commentRepository.create(buildingId, {
    rating: input.rating,
    content: input.content.trim(),
  });

  // Emit event for async summarization
  eventBus.emit(EventTypes.COMMENT_ADDED, {
    buildingId,
    commentId: comment.id,
  });

  return comment;
}

export async function getStats(buildingId: string): Promise<{ count: number; averageRating: number }> {
  const [count, averageRating] = await Promise.all([
    commentRepository.countByBuildingId(buildingId),
    commentRepository.getAverageRatingByBuildingId(buildingId),
  ]);

  return { count, averageRating };
}
