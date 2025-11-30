import { getPool } from '../../infrastructure/database/connection.js';
import type { BuildingRow, SummaryRow } from '../../infrastructure/database/types.js';
import type { Building, BuildingWithSummary, CreateBuildingInput, SearchBuildingsQuery } from './building.types.js';

function mapRowToBuilding(row: BuildingRow): Building {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    priceRange: row.price_range,
    description: row.description,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findAll(query: SearchBuildingsQuery): Promise<Building[]> {
  const pool = getPool();
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

  let sql: string;
  let params: (string | number)[];

  if (query.search) {
    sql = `
      SELECT id, name, address, price_range, description, created_at, updated_at
      FROM buildings
      WHERE address_search @@ plainto_tsquery('english', $1)
      ORDER BY ts_rank(address_search, plainto_tsquery('english', $1)) DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [query.search, limit, offset];
  } else {
    sql = `
      SELECT id, name, address, price_range, description, created_at, updated_at
      FROM buildings
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    params = [limit, offset];
  }

  const result = await pool.query<BuildingRow>(sql, params);
  return result.rows.map(mapRowToBuilding);
}

export async function findById(id: string): Promise<Building | null> {
  const pool = getPool();
  const result = await pool.query<BuildingRow>(
    `SELECT id, name, address, price_range, description, created_at, updated_at
     FROM buildings WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapRowToBuilding(result.rows[0]) : null;
}

export async function findByIdWithSummary(id: string): Promise<BuildingWithSummary | null> {
  const pool = getPool();

  const buildingResult = await pool.query<BuildingRow>(
    `SELECT id, name, address, price_range, description, created_at, updated_at
     FROM buildings WHERE id = $1`,
    [id]
  );

  if (!buildingResult.rows[0]) {
    return null;
  }

  const building = mapRowToBuilding(buildingResult.rows[0]);

  const summaryResult = await pool.query<SummaryRow>(
    `SELECT building_id, content, average_rating, comment_count, last_updated
     FROM summaries WHERE building_id = $1`,
    [id]
  );

  const summaryRow = summaryResult.rows[0];

  return {
    ...building,
    summary: summaryRow
      ? {
          content: summaryRow.content,
          averageRating: parseFloat(summaryRow.average_rating),
          commentCount: summaryRow.comment_count,
          lastUpdated: summaryRow.last_updated.toISOString(),
        }
      : null,
  };
}

export async function create(input: CreateBuildingInput): Promise<Building> {
  const pool = getPool();
  const result = await pool.query<BuildingRow>(
    `INSERT INTO buildings (name, address, price_range, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, address, price_range, description, created_at, updated_at`,
    [input.name, input.address, input.priceRange ?? null, input.description ?? null]
  );
  return mapRowToBuilding(result.rows[0]);
}

export async function exists(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM buildings WHERE id = $1) as exists`,
    [id]
  );
  return result.rows[0].exists;
}
