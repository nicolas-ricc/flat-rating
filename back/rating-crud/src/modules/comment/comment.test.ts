import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { setupTest, teardownTest, request, type TestContext } from '../../test/setup.js';
import { seedBuilding, seedComment } from '../../test/mock-db.js';

describe('Comment API', () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await setupTest();
  });

  after(async () => {
    await teardownTest(ctx);
  });

  describe('GET /api/buildings/:buildingId/comments', () => {
    it('should return 404 for non-existent building', async () => {
      const res = await request(ctx.baseUrl, 'GET', '/api/buildings/non-existent/comments');

      assert.strictEqual(res.status, 404);
      assert.ok((res.body as { error: string }).error.includes('not found'));
    });

    it('should return empty array when no comments exist', async () => {
      const buildingId = 'b-no-comments';
      seedBuilding({
        id: buildingId,
        name: 'Empty Comments Building',
        address: '100 Empty St',
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/buildings/${buildingId}/comments`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.strictEqual((res.body as unknown[]).length, 0);
    });

    it('should return list of comments for building', async () => {
      const buildingId = 'b-with-comments';
      seedBuilding({
        id: buildingId,
        name: 'Comments Building',
        address: '200 Comments St',
      });
      seedComment({
        id: 'c1',
        building_id: buildingId,
        rating: 4,
        content: 'Great place to live!',
      });
      seedComment({
        id: 'c2',
        building_id: buildingId,
        rating: 5,
        content: 'Excellent amenities',
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/buildings/${buildingId}/comments`);

      assert.strictEqual(res.status, 200);

      const comments = res.body as Array<{ id: string; rating: number; content: string }>;
      assert.strictEqual(comments.length, 2);
    });

    it('should have correct response structure', async () => {
      const buildingId = 'b-comment-structure';
      seedBuilding({
        id: buildingId,
        name: 'Structure Building',
        address: '300 Structure St',
      });
      seedComment({
        id: 'c-structure',
        building_id: buildingId,
        rating: 3,
        content: 'Average building',
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/buildings/${buildingId}/comments`);
      const comments = res.body as Array<Record<string, unknown>>;
      const comment = comments[0];

      assert.ok('id' in comment);
      assert.ok('buildingId' in comment);
      assert.ok('rating' in comment);
      assert.ok('content' in comment);
      assert.ok('createdAt' in comment);
    });

    it('should support pagination with limit and offset', async () => {
      const buildingId = 'b-pagination';
      seedBuilding({
        id: buildingId,
        name: 'Pagination Building',
        address: '400 Page St',
      });

      // Seed multiple comments
      for (let i = 0; i < 5; i++) {
        seedComment({
          id: `c-page-${i}`,
          building_id: buildingId,
          rating: 3,
          content: `Comment ${i}`,
        });
      }

      const res = await request(ctx.baseUrl, 'GET', `/api/buildings/${buildingId}/comments?limit=2&offset=1`);

      assert.strictEqual(res.status, 200);
      const comments = res.body as unknown[];
      assert.strictEqual(comments.length, 2);
    });
  });

  describe('POST /api/buildings/:buildingId/comments', () => {
    it('should return 404 for non-existent building', async () => {
      const res = await request(ctx.baseUrl, 'POST', '/api/buildings/non-existent/comments', {
        rating: 4,
        content: 'Great place!',
      });

      assert.strictEqual(res.status, 404);
    });

    it('should create a new comment', async () => {
      const buildingId = 'b-new-comment';
      seedBuilding({
        id: buildingId,
        name: 'New Comment Building',
        address: '500 New Comment St',
      });

      const res = await request(ctx.baseUrl, 'POST', `/api/buildings/${buildingId}/comments`, {
        rating: 5,
        content: 'Amazing building with great views!',
      });

      assert.strictEqual(res.status, 201);

      const comment = res.body as {
        id: string;
        buildingId: string;
        rating: number;
        content: string;
        createdAt: string;
      };

      assert.ok(comment.id);
      assert.strictEqual(comment.buildingId, buildingId);
      assert.strictEqual(comment.rating, 5);
      assert.strictEqual(comment.content, 'Amazing building with great views!');
      assert.ok(comment.createdAt);
    });

    it('should return 400 when content is missing', async () => {
      const buildingId = 'b-missing-content';
      seedBuilding({
        id: buildingId,
        name: 'Missing Content Building',
        address: '600 Missing St',
      });

      const res = await request(ctx.baseUrl, 'POST', `/api/buildings/${buildingId}/comments`, {
        rating: 4,
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('content'));
    });

    it('should return 400 when rating is missing', async () => {
      const buildingId = 'b-missing-rating';
      seedBuilding({
        id: buildingId,
        name: 'Missing Rating Building',
        address: '700 Missing St',
      });

      const res = await request(ctx.baseUrl, 'POST', `/api/buildings/${buildingId}/comments`, {
        content: 'No rating provided',
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('rating'));
    });

    it('should return 400 when rating is below 1', async () => {
      const buildingId = 'b-low-rating';
      seedBuilding({
        id: buildingId,
        name: 'Low Rating Building',
        address: '800 Low St',
      });

      const res = await request(ctx.baseUrl, 'POST', `/api/buildings/${buildingId}/comments`, {
        rating: 0,
        content: 'Invalid rating',
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('rating'));
    });

    it('should return 400 when rating is above 5', async () => {
      const buildingId = 'b-high-rating';
      seedBuilding({
        id: buildingId,
        name: 'High Rating Building',
        address: '900 High St',
      });

      const res = await request(ctx.baseUrl, 'POST', `/api/buildings/${buildingId}/comments`, {
        rating: 6,
        content: 'Invalid rating',
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('rating'));
    });

    it('should return 400 when content is empty string', async () => {
      const buildingId = 'b-empty-content';
      seedBuilding({
        id: buildingId,
        name: 'Empty Content Building',
        address: '1000 Empty St',
      });

      const res = await request(ctx.baseUrl, 'POST', `/api/buildings/${buildingId}/comments`, {
        rating: 3,
        content: '   ',
      });

      assert.strictEqual(res.status, 400);
    });
  });
});
