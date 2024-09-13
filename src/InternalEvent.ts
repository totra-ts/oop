export type InternalEvent<
  EventType extends string,
  Version extends string,
  Payload extends unknown
> = {
  timestamp: number;
  version: Version;
  type: EventType;
  payload: Payload;
};
