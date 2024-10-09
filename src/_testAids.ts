import type { ClassType, EntityClassInternalEvents } from "./_types.js";
import type { DomainEvent } from "./DomainEvent.js";
import type { Entity } from "./Entity.js";
import type { EventBus } from "./EventBus.js";
import type { PolicyOrchestrator } from "./PolicyOrchestrator.js";
import type { EntityProps, Repository } from "./Repository.js";

export class InMemoryEventBus implements EventBus<null> {
  private policyOrchestrators: Set<PolicyOrchestrator>;

  constructor() {
    this.policyOrchestrators = new Set();
  }

  subscribePolicyOrchestrator(policyOrchestrator: PolicyOrchestrator): void {
    this.policyOrchestrators.add(policyOrchestrator);
  }

  publish(events: DomainEvent<string>[], _repositoryMeta: null) {
    this.policyOrchestrators.forEach((policyOrchestrator) => {
      policyOrchestrator.activate(events);
    });
  }
}

export class InMemoryRepository<E extends ClassType<Entity>>
  implements Repository<E, null>
{
  private defaultWhenNotFound: (id: string) => EntityProps<E>;
  private entities: Map<string, EntityProps<E>> = new Map();
  private mapper: (
    entity: EntityProps<E>,
    event: EntityClassInternalEvents<E>
  ) => EntityProps<E>;
  constructor(
    defaultWhenNotFound: (id: string) => EntityProps<E>,
    reducer: (
      entity: EntityProps<E>,
      event: EntityClassInternalEvents<E>
    ) => EntityProps<E>
  ) {
    this.mapper = reducer;
    this.defaultWhenNotFound = defaultWhenNotFound;
  }

  async hydrateReadOnlyEntity(entityId: string) {
    return this.entities.get(entityId) ?? this.defaultWhenNotFound(entityId);
  }
  async hydrateEntity(entityId: string): Promise<[EntityProps<E>, null]> {
    const entity =
      this.entities.get(entityId) ?? this.defaultWhenNotFound(entityId);
    return [entity, null];
  }
  async applyInternalEvents(
    entityId: string,
    internalEvents: EntityClassInternalEvents<E>[],
    _repositoryMeta: null
  ) {
    let [entity] = await this.hydrateEntity(entityId);
    for (const event of internalEvents) {
      entity = this.mapper(entity, event);
    }
    this.entities.set(entityId, entity);
  }
}
