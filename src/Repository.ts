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

export class SimpleRepository<E extends ClassType<Entity>>
  implements Repository<E, null>
{
  private hydrate: (entityId: string) => Promise<EntityProps<E>>;
  private applyEvents: (
    entityId: string,
    internalEvents: EntityClassInternalEvents<E>[]
  ) => Promise<void>;
  constructor(ctx: {
    hydrate: (entityId: string) => Promise<EntityProps<E>>;
    apply: (
      entityId: string,
      internalEvents: EntityClassInternalEvents<E>[]
    ) => Promise<void>;
  }) {
    this.hydrate = ctx.hydrate;
    this.applyEvents = ctx.apply;
  }
  hydrateReadOnlyEntity(entityId: string) {
    return this.hydrate(entityId);
  }
  async hydrateEntity(entityId: string): Promise<[EntityProps<E>, null]> {
    const entity = await this.hydrate(entityId);
    return [entity, null] as const;
  }
  applyInternalEvents(
    entityId: string,
    internalEvents: EntityClassInternalEvents<E>[],
    _repositoryMeta: null
  ) {
    return this.applyEvents(entityId, internalEvents);
  }
}
