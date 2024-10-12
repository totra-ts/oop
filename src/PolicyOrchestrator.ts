import type { DomainEvent } from "./DomainEvent.js";

type DomainEventType<T> = T extends DomainEvent<infer DEType> ? DEType : string;

export class PolicyOrchestrator {
  private policies: Map<string, ((domainEvent: DomainEvent<string>) => void)[]>;
  constructor() {
    this.policies = new Map();
  }

  registerPolicy<E extends DomainEvent<string>>(
    domainEvent: DomainEventType<E>,
    policy: (domainEvent: E) => void
  ) {
    const currentPolicies = this.policies.get(domainEvent) ?? [];
    currentPolicies.push(policy as (domainEvent: DomainEvent<string>) => void);
    this.policies.set(domainEvent, currentPolicies);
  }

  async activate(domainEvents: DomainEvent<string>[]) {
    for (const domainEvent of domainEvents) {
      const policies = this.policies.get(domainEvent.event) ?? [];
      await Promise.allSettled(policies.map((policy) => policy(domainEvent)));
    }
  }
}
