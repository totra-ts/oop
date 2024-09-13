// include userId, orgId, whatever
export interface AuthorizationPolicyPrincipal {}

export interface AuthorizationPolicy {
  readonly policyId: string;
  readonly principal: AuthorizationPolicyPrincipal;
  readonly allow: Set<string>;
}
