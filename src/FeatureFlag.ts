import type { AuthorizationPolicyPrincipal } from "./AuthorizationPolicy.js";

export interface FeatureFlag {
  readonly name: string;
  enabled(principal: AuthorizationPolicyPrincipal): Promise<boolean>;
}
