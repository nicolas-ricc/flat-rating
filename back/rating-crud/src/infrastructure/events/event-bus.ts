import { EventEmitter } from 'node:events';
import { EventTypes, type EventPayloads, type EventType } from './event-types.js';

class TypedEventBus {
  private emitter = new EventEmitter();

  emit<K extends EventType>(event: K, payload: EventPayloads[K]): void {
    this.emitter.emit(event, payload);
  }

  on<K extends EventType>(
    event: K,
    handler: (payload: EventPayloads[K]) => void | Promise<void>
  ): void {
    this.emitter.on(event, handler);
  }

  off<K extends EventType>(
    event: K,
    handler: (payload: EventPayloads[K]) => void | Promise<void>
  ): void {
    this.emitter.off(event, handler);
  }
}

export const eventBus = new TypedEventBus();
export { EventTypes };
