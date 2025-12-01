import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { setupTest, teardownTest, request, type TestContext } from '../../test/setup.js';
import { seedBuilding, seedSummary } from '../../test/mock-db.js';

describe('Building API', () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await setupTest();
  });

  after(async () => {
    await teardownTest(ctx);
  });

  describe('GET /api/buildings', () => {
    it('should return empty array when no buildings exist', async () => {
      const res = await request(ctx.baseUrl, 'GET', '/api/buildings');

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.strictEqual((res.body as unknown[]).length, 0);
    });

    it('should return list of buildings', async () => {
      seedBuilding({
        id: 'b1',
        name: 'Test Building',
        address: '123 Test St',
      });

      const res = await request(ctx.baseUrl, 'GET', '/api/buildings');

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body));

      const buildings = res.body as Array<{ id: string; name: string; address: string }>;
      assert.strictEqual(buildings.length, 1);
      assert.strictEqual(buildings[0].name, 'Test Building');
      assert.strictEqual(buildings[0].address, '123 Test St');
    });

    it('should return buildings matching search query', async () => {
      seedBuilding({
        id: 'b2',
        name: 'Downtown Apartments',
        address: '456 Main Ave',
      });

      const res = await request(ctx.baseUrl, 'GET', '/api/buildings?search=downtown');

      assert.strictEqual(res.status, 200);
      const buildings = res.body as Array<{ name: string }>;
      assert.ok(buildings.some(b => b.name.toLowerCase().includes('downtown')));
    });

    it('should have correct response structure', async () => {
      seedBuilding({
        id: 'b3',
        name: 'Structure Test',
        address: '789 Test Blvd',
        price_range: '$1000-$2000',
        description: 'A test building',
      });

      const res = await request(ctx.baseUrl, 'GET', '/api/buildings');
      const buildings = res.body as Array<Record<string, unknown>>;
      const building = buildings.find(b => b.id === 'b3');

      assert.ok(building);
      assert.ok('id' in building);
      assert.ok('name' in building);
      assert.ok('address' in building);
      assert.ok('priceRange' in building);
      assert.ok('description' in building);
      assert.ok('createdAt' in building);
      assert.ok('updatedAt' in building);
    });
  });

  describe('GET /api/buildings/:id', () => {
    it('should return 404 for non-existent building', async () => {
      const res = await request(ctx.baseUrl, 'GET', '/api/buildings/non-existent-id');

      assert.strictEqual(res.status, 404);
      assert.ok((res.body as { error: string }).error.includes('not found'));
    });

    it('should return building with summary', async () => {
      const buildingId = 'b-detail-1';
      seedBuilding({
        id: buildingId,
        name: 'Detail Test Building',
        address: '100 Detail St',
      });
      seedSummary({
        building_id: buildingId,
        content: 'Great building',
        average_rating: '4.5',
        comment_count: 10,
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/buildings/${buildingId}`);

      assert.strictEqual(res.status, 200);

      const building = res.body as {
        id: string;
        name: string;
        summary: { content: string; averageRating: number; commentCount: number } | null;
      };

      assert.strictEqual(building.id, buildingId);
      assert.strictEqual(building.name, 'Detail Test Building');
      assert.ok(building.summary);
      assert.strictEqual(building.summary.content, 'Great building');
      assert.strictEqual(building.summary.averageRating, 4.5);
      assert.strictEqual(building.summary.commentCount, 10);
    });

    it('should return building with null summary when none exists', async () => {
      const buildingId = 'b-no-summary';
      seedBuilding({
        id: buildingId,
        name: 'No Summary Building',
        address: '200 Empty St',
      });

      const res = await request(ctx.baseUrl, 'GET', `/api/buildings/${buildingId}`);

      assert.strictEqual(res.status, 200);
      const building = res.body as { summary: unknown };
      assert.strictEqual(building.summary, null);
    });
  });

  describe('POST /api/buildings', () => {
    it('should create a new building', async () => {
      const res = await request(ctx.baseUrl, 'POST', '/api/buildings', {
        name: 'New Building',
        address: '500 New St',
        priceRange: '$1500-$2500',
        description: 'A brand new building',
      });

      assert.strictEqual(res.status, 201);

      const building = res.body as {
        id: string;
        name: string;
        address: string;
        priceRange: string;
        description: string;
      };

      assert.ok(building.id);
      assert.strictEqual(building.name, 'New Building');
      assert.strictEqual(building.address, '500 New St');
      assert.strictEqual(building.priceRange, '$1500-$2500');
      assert.strictEqual(building.description, 'A brand new building');
    });

    it('should create building with minimal required fields', async () => {
      const res = await request(ctx.baseUrl, 'POST', '/api/buildings', {
        name: 'Minimal Building',
        address: '600 Minimal St',
      });

      assert.strictEqual(res.status, 201);

      const building = res.body as { name: string; address: string; priceRange: unknown };
      assert.strictEqual(building.name, 'Minimal Building');
      assert.strictEqual(building.address, '600 Minimal St');
      assert.strictEqual(building.priceRange, null);
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(ctx.baseUrl, 'POST', '/api/buildings', {
        address: '700 No Name St',
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('name'));
    });

    it('should return 400 when address is missing', async () => {
      const res = await request(ctx.baseUrl, 'POST', '/api/buildings', {
        name: 'No Address Building',
      });

      assert.strictEqual(res.status, 400);
      assert.ok((res.body as { error: string }).error.toLowerCase().includes('address'));
    });

    it('should return 400 when name is empty string', async () => {
      const res = await request(ctx.baseUrl, 'POST', '/api/buildings', {
        name: '   ',
        address: '800 Empty Name St',
      });

      assert.strictEqual(res.status, 400);
    });
  });
});
