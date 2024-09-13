import type { DomainEvent } from "../../src/DomainEvent.js";
import { Entity } from "../../src/Entity.js";
import type { InternalEvent } from "../../src/InternalEvent.js";

export type WarehouseInternalEvent =
  | InternalEvent<
      "NewInventoryLotLocation",
      "1",
      {
        lotId: string;
        location: string;
      }
    >
  | InternalEvent<
      "InventoryReceived",
      "1",
      {
        lotId: string;
        location: string;
        quantity: number;
      }
    >
  | InternalEvent<
      "InventoryShipped",
      "1",
      {
        lotId: number;
        location: string;
        quantity: number;
      }
    >
  | InternalEvent<
      "InventorySpoiled",
      "1",
      {
        lotId: number;
        location: string;
        quantity: number;
      }
    >
  | InternalEvent<
      "InventoryMoved",
      "1",
      {
        lotId: number;
        fromLocation: string;
        toLocation: string;
        quantity: number;
      }
    >;

export type WarehouseDomainEvent = DomainEvent<
  | "Warehouse:InventoryAdjusted"
  | "Warehouse:InventoryReceived"
  | "Warehouse:InventoryShipped"
>;

export class WarehousedProduct extends Entity<
  WarehouseInternalEvent,
  WarehouseDomainEvent
> {
  protected state: {
    id: string;
    lots: {
      id: string;
      location: string;
      quantity: number;
      onHoldQuantity: number;
    }[];
  };

  constructor(context: {
    id: string;
    lots: {
      id: string;
      location: string;
      quantity: number;
      onHoldQuantity: number;
    }[];
  }) {
    super();
    this.state = context;
  }

  reduceInternalEventsToDomainEvents(
    events: WarehouseInternalEvent[]
  ): WarehouseDomainEvent[] {
    return events.map((e): WarehouseDomainEvent => {
      switch (e.type) {
        case "InventoryMoved":
          return {
            event: "Warehouse:InventoryAdjusted",
            entityId: this.state.id,
          };
        case "InventoryShipped":
          return {
            event: "Warehouse:InventoryShipped",
            entityId: this.state.id,
          };
        case "InventoryReceived":
          return {
            event: "Warehouse:InventoryReceived",
            entityId: this.state.id,
          };
        case "InventorySpoiled":
          return {
            event: "Warehouse:InventoryAdjusted",
            entityId: this.state.id,
          };
        case "NewInventoryLotLocation":
          return {
            event: "Warehouse:InventoryAdjusted",
            entityId: this.state.id,
          };
        default:
          throw new Error();
      }
    });
  }
}
