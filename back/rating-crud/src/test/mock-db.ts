/**
 * Mock database for testing without PostgreSQL
 * Simulates pg Pool query responses
 */

import type { QueryResult } from 'pg';

interface MockData {
  buildings: Map<string, BuildingRow>;
  comments: Map<string, CommentRow>;
  summaries: Map<string, SummaryRow>;
}

interface BuildingRow {
  id: string;
  name: string;
  address: string;
  price_range: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CommentRow {
  id: string;
  building_id: string;
  rating: number;
  content: string;
  created_at: Date;
}

interface SummaryRow {
  building_id: string;
  content: string;
  average_rating: string;
  comment_count: number;
  last_updated: Date;
}

const mockData: MockData = {
  buildings: new Map(),
  comments: new Map(),
  summaries: new Map(),
};

export function resetMockData(): void {
  mockData.buildings.clear();
  mockData.comments.clear();
  mockData.summaries.clear();
}

export function seedBuilding(building: Partial<BuildingRow> & { id: string; name: string; address: string }): BuildingRow {
  const row: BuildingRow = {
    id: building.id,
    name: building.name,
    address: building.address,
    price_range: building.price_range ?? null,
    description: building.description ?? null,
    created_at: building.created_at ?? new Date(),
    updated_at: building.updated_at ?? new Date(),
  };
  mockData.buildings.set(row.id, row);
  return row;
}

export function seedComment(comment: Partial<CommentRow> & { id: string; building_id: string; rating: number; content: string }): CommentRow {
  const row: CommentRow = {
    id: comment.id,
    building_id: comment.building_id,
    rating: comment.rating,
    content: comment.content,
    created_at: comment.created_at ?? new Date(),
  };
  mockData.comments.set(row.id, row);
  return row;
}

export function seedSummary(summary: Partial<SummaryRow> & { building_id: string }): SummaryRow {
  const row: SummaryRow = {
    building_id: summary.building_id,
    content: summary.content ?? '',
    average_rating: summary.average_rating ?? '0',
    comment_count: summary.comment_count ?? 0,
    last_updated: summary.last_updated ?? new Date(),
  };
  mockData.summaries.set(row.building_id, row);
  return row;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function createQueryResult<T>(rows: T[]): QueryResult<T> {
  return {
    rows,
    command: '',
    rowCount: rows.length,
    oid: 0,
    fields: [],
  };
}

/**
 * Mock query handler - parses SQL and returns appropriate mock data
 */
export function mockQuery<T>(sql: string, params?: unknown[]): QueryResult<T> {
  const normalizedSql = sql.toLowerCase().replace(/\s+/g, ' ').trim();

  // SELECT buildings
  if (normalizedSql.includes('from buildings') && normalizedSql.includes('select')) {
    // EXISTS check (must come before 'where id = $1' since EXISTS query also contains it)
    if (normalizedSql.includes('select exists(')) {
      const id = params?.[0] as string;
      const exists = mockData.buildings.has(id);
      return createQueryResult([{ exists }]) as QueryResult<T>;
    }

    // Get by ID
    if (normalizedSql.includes('where id = $1')) {
      const id = params?.[0] as string;
      const building = mockData.buildings.get(id);
      return createQueryResult(building ? [building] : []) as QueryResult<T>;
    }

    // Search with ts_vector
    if (normalizedSql.includes('plainto_tsquery')) {
      const search = (params?.[0] as string)?.toLowerCase() ?? '';
      const limit = (params?.[1] as number) ?? 50;
      const offset = (params?.[2] as number) ?? 0;

      const results = Array.from(mockData.buildings.values())
        .filter(b => b.name.toLowerCase().includes(search) || b.address.toLowerCase().includes(search))
        .slice(offset, offset + limit);

      return createQueryResult(results) as QueryResult<T>;
    }

    // List all
    const limit = (params?.[0] as number) ?? 50;
    const offset = (params?.[1] as number) ?? 0;
    const results = Array.from(mockData.buildings.values())
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(offset, offset + limit);

    return createQueryResult(results) as QueryResult<T>;
  }

  // INSERT building
  if (normalizedSql.includes('insert into buildings')) {
    const id = generateUUID();
    const now = new Date();
    const building: BuildingRow = {
      id,
      name: params?.[0] as string,
      address: params?.[1] as string,
      price_range: params?.[2] as string | null,
      description: params?.[3] as string | null,
      created_at: now,
      updated_at: now,
    };
    mockData.buildings.set(id, building);
    return createQueryResult([building]) as QueryResult<T>;
  }

  // SELECT comments
  if (normalizedSql.includes('from comments') && normalizedSql.includes('select')) {
    const buildingId = params?.[0] as string;

    // COUNT
    if (normalizedSql.includes('count(*)')) {
      const count = Array.from(mockData.comments.values())
        .filter(c => c.building_id === buildingId).length;
      return createQueryResult([{ count: String(count) }]) as QueryResult<T>;
    }

    // AVG
    if (normalizedSql.includes('avg(rating)')) {
      const comments = Array.from(mockData.comments.values())
        .filter(c => c.building_id === buildingId);
      const avg = comments.length > 0
        ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
        : null;
      return createQueryResult([{ avg: avg?.toString() ?? null }]) as QueryResult<T>;
    }

    // List by building
    const limit = (params?.[1] as number) ?? 50;
    const offset = (params?.[2] as number) ?? 0;
    const results = Array.from(mockData.comments.values())
      .filter(c => c.building_id === buildingId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(offset, offset + limit);

    return createQueryResult(results) as QueryResult<T>;
  }

  // INSERT comment
  if (normalizedSql.includes('insert into comments')) {
    const id = generateUUID();
    const comment: CommentRow = {
      id,
      building_id: params?.[0] as string,
      rating: params?.[1] as number,
      content: params?.[2] as string,
      created_at: new Date(),
    };
    mockData.comments.set(id, comment);
    return createQueryResult([comment]) as QueryResult<T>;
  }

  // SELECT summaries
  if (normalizedSql.includes('from summaries') && normalizedSql.includes('select')) {
    const buildingId = params?.[0] as string;
    const summary = mockData.summaries.get(buildingId);
    return createQueryResult(summary ? [summary] : []) as QueryResult<T>;
  }

  // INSERT/UPDATE summary (upsert)
  if (normalizedSql.includes('insert into summaries')) {
    const buildingId = params?.[0] as string;
    const summary: SummaryRow = {
      building_id: buildingId,
      content: params?.[1] as string,
      average_rating: String(params?.[2]),
      comment_count: params?.[3] as number,
      last_updated: new Date(),
    };
    mockData.summaries.set(buildingId, summary);
    return createQueryResult([summary]) as QueryResult<T>;
  }

  // Default empty result
  return createQueryResult([]) as QueryResult<T>;
}

/**
 * Create a mock pool object
 */
export function createMockPool() {
  return {
    query: <T>(sql: string, params?: unknown[]) => Promise.resolve(mockQuery<T>(sql, params)),
    end: () => Promise.resolve(),
    on: () => {},
  };
}
