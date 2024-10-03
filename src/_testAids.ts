import type { DomainEvent } from "./DomainEvent.js";
import type { EventBus } from "./EventBus.js";
import type { PolicyOrchestrator } from "./PolicyOrchestrator.js";

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
