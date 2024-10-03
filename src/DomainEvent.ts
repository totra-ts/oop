export type DomainEvent<EventType extends string> = {
  event: EventType;
  entityId: string;
  eventId: string;
  timestamp: number;
};
