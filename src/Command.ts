export abstract class Command<Type extends string, Payload extends unknown> {
  readonly type: Type;
  readonly payload: Payload;
  readonly entityId: string;
  readonly requiredPolicies: readonly string[];

  constructor(
    type: Type,
    entityId: string,
    payload: Payload,
    requiredPolicies: readonly string[]
  ) {
    this.type = type;
    this.entityId = entityId;
    this.payload = payload;
    this.requiredPolicies = requiredPolicies;
  }
}

// export class PlaceOrder extends Command<"PlaceOrder", { orderId: string }> {
//   static readonly requiredPolicies = ["order:place"] as const;

//   constructor(payload: { orderId: string }) {
//     super("PlaceOrder", payload);
//   }
// }

// PlaceOrder.requiredPolicies;
