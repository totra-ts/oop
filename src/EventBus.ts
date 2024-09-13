import type { DomainEvent } from "./DomainEvent.js";

export interface EventBus<RepositoryMeta extends unknown> {
  publish: (
    events: DomainEvent<string>[],
    repositoryMeta: RepositoryMeta
  ) => void;
}
