import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { setupTest, teardownTest, request, type TestContext } from '../../test/setup.js';
import { seedBuilding, seedSummary } from '../../test/mock-db.js';

describe('Summary API', () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await setupTest();
  });

  after(async () => {
    await teardownTest(ctx);
  });

  describe('GET /api/summaries/:buildingId', () => {
    it('should return 404 when summary does not exist', async () => {
      const res = await request(ctx.baseUrl, 'GET', '/api/summaries/non-existent');

      assert.strictEqual(res.status, 404);
      assert.ok((res.body as { error: string }).error.includes('not found'));
    });

    it('should return summary for building', async () => {
      const buildingId = 'b-with-summary';
      seedBuilding({
        id: buildingId,
        name: 'Summary Building',
        address: '100 Summary St',
      });
      seedSummary({
        building_id: buildingId,
        content: 'This is a great building with excellent amenities.',
        average_rating: '4.2',
        comment_count: 15,
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/summaries/${buildingId}`);

      assert.strictEqual(res.status, 200);

      const summary = res.body as {
        buildingId: string;
        content: string;
        averageRating: number;
        commentCount: number;
        lastUpdated: string;
      };

      assert.strictEqual(summary.buildingId, buildingId);
      assert.strictEqual(summary.content, 'This is a great building with excellent amenities.');
      assert.strictEqual(summary.averageRating, 4.2);
      assert.strictEqual(summary.commentCount, 15);
      assert.ok(summary.lastUpdated);
    });

    it('should have correct response structure', async () => {
      const buildingId = 'b-summary-structure';
      seedBuilding({
        id: buildingId,
        name: 'Structure Building',
        address: '200 Structure St',
      });
      seedSummary({
        building_id: buildingId,
        content: 'Test content',
        average_rating: '3.5',
        comment_count: 5,
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/summaries/${buildingId}`);
      const summary = res.body as Record<string, unknown>;

      assert.ok('buildingId' in summary);
      assert.ok('content' in summary);
      assert.ok('averageRating' in summary);
      assert.ok('commentCount' in summary);
      assert.ok('lastUpdated' in summary);
    });
  });

  describe('PUT /api/summaries/:buildingId', () => {
    it('should return 404 for non-existent building', async () => {
      const res = await request(ctx.baseUrl, 'PUT', '/api/summaries/non-existent', {
        content: 'New summary',
        averageRating: 4.0,
        commentCount: 10,
      });

      assert.strictEqual(res.status, 404);
    });

    it('should create summary for building without existing summary', async () => {
      const buildingId = 'b-create-summary';
      seedBuilding({
        id: buildingId,
        name: 'Create Summary Building',
        address: '300 Create St',
      });

      const res = await request(ctx.baseUrl, 'PUT', `/api/summaries/${buildingId}`, {
        content: 'Newly created summary for this building.',
        averageRating: 4.5,
        commentCount: 20,
      });

      assert.strictEqual(res.status, 200);

      const summary = res.body as {
        buildingId: string;
        content: string;
        averageRating: number;
        commentCount: number;
      };

      assert.strictEqual(summary.buildingId, buildingId);
      assert.strictEqual(summary.content, 'Newly created summary for this building.');
      assert.strictEqual(summary.averageRating, 4.5);
      assert.strictEqual(summary.commentCount, 20);
    });

    it('should update existing summary', async () => {
      const buildingId = 'b-update-summary';
      seedBuilding({
        id: buildingId,
        name: 'Update Summary Building',
        address: '400 Update St',
      });
      seedSummary({
        building_id: buildingId,
        content: 'Old summary content',
        average_rating: '3.0',
        comment_count: 5,
      });

      const res = await request(ctx.baseUrl, 'PUT', `/api/summaries/${buildingId}`, {
        content: 'Updated summary content with new information.',
        averageRating: 4.2,
        commentCount: 25,
      });

      assert.strictEqual(res.status, 200);

      const summary = res.body as {
        content: string;
        averageRating: number;
        commentCount: number;
      };

      assert.strictEqual(summary.content, 'Updated summary content with new information.');
      assert.strictEqual(summary.averageRating, 4.2);
      assert.strictEqual(summary.commentCount, 25);
    });

    it('should return 400 when averageRating is negative', async () => {
      const buildingId = 'b-negative-rating';
      seedBuilding({
        id: buildingId,
        name: 'Negative Rating Building',
        address: '500 Negative St',
      });

      const res = await request(ctx.baseUrl, 'PUT', `/api/summaries/${buildingId}`, {
        content: 'Summary',
        averageRating: -1,
        commentCount: 5,
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('rating'));
    });

    it('should return 400 when averageRating exceeds 5', async () => {
      const buildingId = 'b-high-avg-rating';
      seedBuilding({
        id: buildingId,
        name: 'High Avg Rating Building',
        address: '600 High St',
      });

      const res = await request(ctx.baseUrl, 'PUT', `/api/summaries/${buildingId}`, {
        content: 'Summary',
        averageRating: 5.5,
        commentCount: 5,
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('rating'));
    });

    it('should return 400 when commentCount is negative', async () => {
      const buildingId = 'b-negative-count';
      seedBuilding({
        id: buildingId,
        name: 'Negative Count Building',
        address: '700 Negative St',
      });

      const res = await request(ctx.baseUrl, 'PUT', `/api/summaries/${buildingId}`, {
        content: 'Summary',
        averageRating: 4.0,
        commentCount: -5,
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('count'));
    });

    it('should have correct response structure after update', async () => {
      const buildingId = 'b-response-structure';
      seedBuilding({
        id: buildingId,
        name: 'Response Structure Building',
        address: '800 Response St',
      });

      const res = await request(ctx.baseUrl, 'PUT', `/api/summaries/${buildingId}`, {
        content: 'Test summary',
        averageRating: 3.8,
        commentCount: 12,
      });

      const summary = res.body as Record<string, unknown>;

      assert.ok('buildingId' in summary);
      assert.ok('content' in summary);
      assert.ok('averageRating' in summary);
      assert.ok('commentCount' in summary);
      assert.ok('lastUpdated' in summary);
    });
  });
});
