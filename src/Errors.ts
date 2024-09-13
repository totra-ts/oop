export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  constructor(missingPolicies: string[]) {
    super(`Missing Policies: ${missingPolicies.join(", ")}`);
    this.name = "UnauthorizedError";
  }
}
