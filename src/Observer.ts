import type { AuthorizationPolicyPrincipal } from "./AuthorizationPolicy.js";
import { Command } from "./Command.js";
import type { DomainEvent } from "./DomainEvent.js";
import type { FeatureFlag } from "./FeatureFlag.js";

export interface Observer {
  recordCommand?: (
    principal: AuthorizationPolicyPrincipal,
    command: Command<string, unknown>
  ) => void;
  recordFeatureFlag?: (
    principal: AuthorizationPolicyPrincipal,
    command: Command<string, unknown>,
    featureFlag: FeatureFlag
  ) => void;
  recordError?: (
    principal: AuthorizationPolicyPrincipal,
    command: Command<string, unknown>,
    error: Error
  ) => void;
  recordDomainEvents?: (
    principal: AuthorizationPolicyPrincipal,
    fromCommand: Command<string, unknown>,
    events: DomainEvent<string>[]
  ) => void;
}
