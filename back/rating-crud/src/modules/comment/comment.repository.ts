import { getPool } from '../../infrastructure/database/connection.js';
import type { CommentRow } from '../../infrastructure/database/types.js';
import type { Comment, CreateCommentInput, ListCommentsQuery } from './comment.types.js';

function mapRowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    buildingId: row.building_id,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  };
}

export async function findByBuildingId(
  buildingId: string,
  query: ListCommentsQuery
): Promise<Comment[]> {
  const pool = getPool();
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

  const result = await pool.query<CommentRow>(
    `SELECT id, building_id, rating, content, created_at
     FROM comments
     WHERE building_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [buildingId, limit, offset]
  );

  return result.rows.map(mapRowToComment);
}

export async function create(
  buildingId: string,
  input: CreateCommentInput
): Promise<Comment> {
  const pool = getPool();
  const result = await pool.query<CommentRow>(
    `INSERT INTO comments (building_id, rating, content)
     VALUES ($1, $2, $3)
     RETURNING id, building_id, rating, content, created_at`,
    [buildingId, input.rating, input.content]
  );

  return mapRowToComment(result.rows[0]);
}

export async function countByBuildingId(buildingId: string): Promise<number> {
  const pool = getPool();
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM comments WHERE building_id = $1`,
    [buildingId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function getAverageRatingByBuildingId(buildingId: string): Promise<number> {
  const pool = getPool();
  const result = await pool.query<{ avg: string | null }>(
    `SELECT AVG(rating) as avg FROM comments WHERE building_id = $1`,
    [buildingId]
  );
  return result.rows[0].avg ? parseFloat(result.rows[0].avg) : 0;
}
