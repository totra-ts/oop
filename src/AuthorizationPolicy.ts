// include userId, orgId, whatever
export interface AuthorizationPolicyPrincipal {}

export interface AuthorizationPolicy {
  readonly policyId: string;
  readonly principal: AuthorizationPolicyPrincipal;
  readonly allow: Set<string>;
  readonly entityBoundedStatements?: {
    readonly allow: Set<string>;
    readonly entities: Set<string>;
  }[];
}

export const getMissingPolicies = (p: {
  entityId: string;
  requiredPolicies: string[];
  authorizationPolicy: AuthorizationPolicy;
}) => {
  const missingPolicies = p.requiredPolicies
    .filter((policy) => !p.authorizationPolicy.allow.has(policy))
    .filter((policy) => {
      for (const statement of p.authorizationPolicy.entityBoundedStatements ??
        []) {
        if (statement.allow.has(policy) && statement.entities.has(p.entityId)) {
          return false;
        }
      }
      return true;
    });
  return missingPolicies;
};
