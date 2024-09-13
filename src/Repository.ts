import type { ClassType, EntityClassInternalEvents } from "./_types.js";
import { Entity } from "./Entity.js";

export interface Repository<
  E extends ClassType<Entity>,
  RepositoryMeta extends unknown
> {
  hydrateEntity: (
    entityId: string
  ) => Promise<[ConstructorParameters<E>, RepositoryMeta]>;
  applyInternalEvents: (
    entityId: string,
    internalEvents: EntityClassInternalEvents<E>[],
    repositoryMeta: RepositoryMeta
  ) => Promise<void>;
}
