/**
 * Test setup utilities
 */

import { createServer, type Server } from 'node:http';
import { createApp } from '../server.js';
import { setPool, resetPool } from '../infrastructure/database/connection.js';
import { createMockPool, resetMockData } from './mock-db.js';

export interface TestContext {
  server: Server;
  baseUrl: string;
}

/**
 * Setup test environment with mock database
 */
export async function setupTest(): Promise<TestContext> {
  // Reset and inject mock pool
  resetMockData();
  setPool(createMockPool());

  // Create and start server
  const app = createApp();
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to get server address');
  }

  return {
    server,
    baseUrl: `http://localhost:${address.port}`,
  };
}

/**
 * Cleanup test environment
 */
export async function teardownTest(ctx: TestContext): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    ctx.server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  resetPool();
  resetMockData();
}

/**
 * Make HTTP request to test server
 */
export async function request(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; body: unknown }> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, options);
  const responseBody = await response.json().catch(() => null);

  return {
    status: response.status,
    body: responseBody,
  };
}
