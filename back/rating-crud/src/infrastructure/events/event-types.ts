export const EventTypes = {
  COMMENT_ADDED: 'COMMENT_ADDED',
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export interface EventPayloads {
  [EventTypes.COMMENT_ADDED]: {
    buildingId: string;
    commentId: string;
  };
}
