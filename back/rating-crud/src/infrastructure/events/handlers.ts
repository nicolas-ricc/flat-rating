import { config } from '../config/index.js';
import { eventBus, EventTypes } from './event-bus.js';

export function registerEventHandlers(): void {
  eventBus.on(EventTypes.COMMENT_ADDED, async ({ buildingId }) => {
    try {
      const response = await fetch(`${config.interpreterUrl}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId }),
      });

      if (!response.ok) {
        console.error(`Interpreter webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Interpreter webhook error:', error);
    }
  });

  console.log('Event handlers registered');
}
