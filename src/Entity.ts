import type { DomainEvent } from "./DomainEvent.js";
import type { InternalEvent } from "./InternalEvent.js";

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

  protected recordEvent(event: IEvent) {
    this.internalEvents.push(event);
  }

  abstract reduceInternalEventsToDomainEvents(events: IEvent[]): DEvent[];
}
