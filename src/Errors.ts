import type { Command } from "./Command.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvariantError";
  }
}

export class UndefinedCommandError<
  T extends Command<string, any>
> extends Error {
  constructor(command: T) {
    super(`Unknown Command: ${command.type}`);
    this.name = "UndefinedCommandError";
  }
}

export class UnauthorizedError extends Error {
  constructor(missingPolicies: string[]) {
    super(`Missing Policies: ${missingPolicies.join(", ")}`);
    this.name = "UnauthorizedError";
  }
}
