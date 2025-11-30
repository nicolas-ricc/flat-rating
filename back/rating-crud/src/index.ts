import { createApp } from './server.js';
import { config } from './infrastructure/config/index.js';
import { closePool } from './infrastructure/database/connection.js';
import { registerEventHandlers } from './infrastructure/events/handlers.js';

const app = createApp();

registerEventHandlers();

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  server.close(async () => {
    await closePool();
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  server.close(async () => {
    await closePool();
    console.log('Server closed');
    process.exit(0);
  });
});
