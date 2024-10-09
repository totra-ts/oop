import type { ClassType, EntityClassInternalEvents } from "./_types.js";
import type { Command } from "./Command.js";
import { Entity } from "./Entity.js";

export type EntityProps<E extends ClassType<Entity>> =
  ConstructorParameters<E>[0];

export interface Repository<
  E extends ClassType<Entity>,
  RepositoryMeta extends unknown
> {
  recordCommand?: (
    command: Command<string, unknown>
  ) => Promise<{ commandProcessed: boolean }>;
  hydrateReadOnlyEntity: (entityId: string) => Promise<EntityProps<E>>;
  hydrateEntity: (
    entityId: string
  ) => Promise<[EntityProps<E>, RepositoryMeta]>;
  applyInternalEvents: (
    entityId: string,
    internalEvents: EntityClassInternalEvents<E>[],
    repositoryMeta: RepositoryMeta
  ) => Promise<void>;
}
