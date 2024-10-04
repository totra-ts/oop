export abstract class Command<Type extends string, Payload extends unknown> {
  readonly commandId?: string;
  readonly type: Type;
  readonly payload: Payload;
  readonly entityId: string;
  readonly requiredPolicies: readonly string[];

  constructor(p: {
    type: Type;
    commandId?: string;
    entityId: string;
    payload: Payload;
    requiredPolicies: readonly string[];
  }) {
    this.type = p.type;
    this.commandId = p.commandId;
    this.entityId = p.entityId;
    this.payload = p.payload;
    this.requiredPolicies = p.requiredPolicies;
  }
}
