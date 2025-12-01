import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

// Use 'any' to allow mock pool injection in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Set a mock pool for testing purposes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setPool(mockPool: any): void {
  pool = mockPool;
}

/**
 * Reset pool to null (for testing cleanup)
 */
export function resetPool(): void {
  pool = null;
}
