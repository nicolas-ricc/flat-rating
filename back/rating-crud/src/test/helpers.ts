import { createServer, type Server } from 'node:http';
import { createApp } from '../server.js';

/**
 * Test HTTP client - makes requests to the test server
 */
export interface TestResponse {
  status: number;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export async function request(
  server: Server,
  method: string,
  path: string,
  body?: unknown
): Promise<TestResponse> {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server not listening');
  }

  const url = `http://localhost:${address.port}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const responseBody = await response.json().catch(() => null);

  const headers: Record<string, string | string[] | undefined> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    status: response.status,
    body: responseBody,
    headers,
  };
}

/**
 * In-memory mock database for testing
 */
export interface MockBuilding {
  id: string;
  name: string;
  address: string;
  price_range: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MockComment {
  id: string;
  building_id: string;
  rating: number;
  content: string;
  created_at: Date;
}

export interface MockSummary {
  building_id: string;
  content: string;
  average_rating: string;
  comment_count: number;
  last_updated: Date;
}

export interface MockDatabase {
  buildings: MockBuilding[];
  comments: MockComment[];
  summaries: MockSummary[];
}

export function createMockDatabase(): MockDatabase {
  return {
    buildings: [],
    comments: [],
    summaries: [],
  };
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Create a test server with mocked database
 */
export function createTestServer(): Server {
  const app = createApp();
  return createServer(app);
}

export function startServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.listen(0, () => resolve());
  });
}

export function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
