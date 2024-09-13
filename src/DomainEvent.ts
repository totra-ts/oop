export type DomainEvent<EventType extends string> = {
  event: EventType;
  entityId: string;
};
