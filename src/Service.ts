import type {
  ClassType,
  EntityClassInternalEvents,
  RepositoryMeta,
} from "./_types.js";
import type { AuthorizationPolicy } from "./AuthorizationPolicy.js";
import { Command } from "./Command.js";
import { Entity } from "./Entity.js";
import { UnauthorizedError, UndefinedCommandError } from "./Errors.js";
import type { EventBus } from "./EventBus.js";
import type { FeatureFlag } from "./FeatureFlag.js";
import type { Observer } from "./Observer.js";
import type { Repository } from "./Repository.js";
import type { UseCase } from "./UseCase.js";

export class Service<
  E extends Entity,
  R extends Repository<ClassType<E>, any>
> {
  private map: Map<
    ClassType<Command<string, unknown>>,
    [FeatureFlag, ClassType<E & UseCase<Command<string, unknown>>>][]
  > = new Map();

  private observer: Observer | undefined;
  private eventBus: EventBus<RepositoryMeta<R>>;
  private repository: R;
  private ServiceEntity: ClassType<E>;

  constructor({
    repository,
    eventBus,
    observer,
    entity,
  }: {
    repository: R;
    eventBus: EventBus<RepositoryMeta<R>>;
    observer?: Observer;
    entity: ClassType<E>;
  }) {
    this.repository = repository;
    this.eventBus = eventBus;
    this.observer = observer;
    this.ServiceEntity = entity;
  }

  async loadEntity(entityId: string) {
    return new this.ServiceEntity(
      ...(await this.repository.hydrateReadOnlyEntity(entityId))
    );
  }

  register<T extends Command<string, unknown>>(
    command: ClassType<T>,
    behavior: [FeatureFlag, ClassType<E & UseCase<T>>][]
  ) {
    this.map.set(command, behavior as any);
  }

  async handle(
    command: Command<string, unknown>,
    authorizationPolicy: AuthorizationPolicy
  ) {
    this.observer?.recordCommand?.(authorizationPolicy.principal, command);
    const behavior = this.map.get(command.constructor as any);

    const missingPolicies = command.requiredPolicies
      .filter((policy) => !authorizationPolicy.allow.has(policy))
      .filter((policy) => {
        for (const statement of authorizationPolicy.entityBoundedStatements ??
          []) {
          if (
            statement.allow.has(policy) &&
            statement.entities.has(command.entityId)
          ) {
            return false;
          }
        }
        return true;
      });

    try {
      if (missingPolicies.length) throw new UnauthorizedError(missingPolicies);
      if (!behavior) throw new UndefinedCommandError(command);

      for (const [flag, UseCase] of behavior) {
        const flagValue = await flag.enabled(authorizationPolicy.principal);
        if (!flagValue) continue;
        this.observer?.recordFeatureFlag?.(
          authorizationPolicy.principal,
          command,
          flag
        );
        const [context, repositoryMeta] = await this.repository.hydrateEntity(
          command.entityId
        );
        const useCase = new UseCase(...context);
        useCase.handle(command);
        this.repository.applyInternalEvents(
          command.entityId,
          useCase.getInternalEvents() as EntityClassInternalEvents<
            ClassType<E>
          >[],
          repositoryMeta
        );
        const domainEvents = useCase.getDomainEvents();
        this.observer?.recordDomainEvents?.(
          authorizationPolicy.principal,
          command,
          domainEvents
        );
        await this.eventBus.publish(domainEvents, repositoryMeta);
        return; // only invoke the first matching behavior
      }
    } catch (e) {
      this.observer?.recordError?.(
        authorizationPolicy.principal,
        command,
        e as Error
      );
      throw e;
    }
  }
}
