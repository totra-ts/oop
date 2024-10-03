import type { DomainEvent } from "./DomainEvent.js";
import type { InternalEvent } from "./InternalEvent.js";

type OptionalTimestamp<T> = T extends { timestamp: number }
  ? Omit<T, "timestamp"> & { timestamp?: number }
  : T;

export abstract class Entity<
  IEvent extends InternalEvent<string, string, unknown> = InternalEvent<
    string,
    string,
    unknown
  >,
  DEvent extends DomainEvent<string> = DomainEvent<string>
> {
  private internalEvents: IEvent[] = [];

  getInternalEvents() {
    // return a copy to help prevent
    return this.internalEvents.slice();
  }

  getDomainEvents() {
    return this.reduceInternalEventsToDomainEvents(this.getInternalEvents());
  }

  protected recordEvent<E extends IEvent>(event: OptionalTimestamp<E>) {
    this.internalEvents.push({
      ...event,
      timestamp: event.timestamp ?? Date.now(),
    } as E);
  }

  abstract reduceInternalEventsToDomainEvents(events: IEvent[]): DEvent[];
}
