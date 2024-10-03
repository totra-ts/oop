import type { WarehouseInternalEvent } from "../inventoriedProduct.js";
import { InventoryRepository } from "./inventoryRepository.js";

function fetchProductFromDatabaseOrWhatever(entityId: string) {
  return Promise.resolve({
    id: entityId,
    lots: [
      {
        id: "1",
        location: "A1",
        quantity: 10,
        onHoldQuantity: 0,
      },
    ],
  });
}

function storeDataInDB() {}

type Meta = {
  tx: null;
};

export class DemoInventoryRepository extends InventoryRepository<Meta> {
  async applyInternalEvents(
    entityId: string,
    internalEvents: WarehouseInternalEvent[],
    repositoryMeta: Meta
  ) {
    for (const event of internalEvents) {
      const type = event.type;
      // step by step, define how this impacts
      // your db, external services, etc
      switch (type) {
        case "InventoryMoved":
        case "InventoryReceived":
        case "InventoryShipped":
        case "NewInventoryLotLocation":
        case "InventorySpoiled":
          storeDataInDB();
          break;
        default: {
          const _t: never = type;
          console.log(_t);
        }
      }
    }
  }

  async hydrateEntity(entityId: string): Promise<
    [
      [
        context: {
          id: string;
          lots: {
            id: string;
            location: string;
            quantity: number;
            onHoldQuantity: number;
          }[];
        }
      ],
      Meta
    ]
  > {
    const product = await fetchProductFromDatabaseOrWhatever(entityId);
    return [[product], { tx: null }];
  }

  async hydrateReadOnlyEntity(entityId: string): Promise<
    {
      id: string;
      lots: {
        id: string;
        location: string;
        quantity: number;
        onHoldQuantity: number;
      }[];
    }[]
  > {
    const product = await fetchProductFromDatabaseOrWhatever(entityId);
    return [product];
  }
}
