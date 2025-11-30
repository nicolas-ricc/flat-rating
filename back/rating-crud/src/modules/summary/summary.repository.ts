import { getPool } from '../../infrastructure/database/connection.js';
import type { SummaryRow } from '../../infrastructure/database/types.js';
import type { Summary, UpdateSummaryInput } from './summary.types.js';

function mapRowToSummary(row: SummaryRow): Summary {
  return {
    buildingId: row.building_id,
    content: row.content,
    averageRating: parseFloat(row.average_rating),
    commentCount: row.comment_count,
    lastUpdated: row.last_updated.toISOString(),
  };
}

export async function findByBuildingId(buildingId: string): Promise<Summary | null> {
  const pool = getPool();
  const result = await pool.query<SummaryRow>(
    `SELECT building_id, content, average_rating, comment_count, last_updated
     FROM summaries WHERE building_id = $1`,
    [buildingId]
  );

  return result.rows[0] ? mapRowToSummary(result.rows[0]) : null;
}

export async function upsert(buildingId: string, input: UpdateSummaryInput): Promise<Summary> {
  const pool = getPool();
  const result = await pool.query<SummaryRow>(
    `INSERT INTO summaries (building_id, content, average_rating, comment_count, last_updated)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (building_id)
     DO UPDATE SET
       content = EXCLUDED.content,
       average_rating = EXCLUDED.average_rating,
       comment_count = EXCLUDED.comment_count,
       last_updated = NOW()
     RETURNING building_id, content, average_rating, comment_count, last_updated`,
    [buildingId, input.content, input.averageRating, input.commentCount]
  );

  return mapRowToSummary(result.rows[0]);
}
