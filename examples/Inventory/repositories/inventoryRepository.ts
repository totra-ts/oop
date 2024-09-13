import type { Repository } from "../../../src/Repository.js";
import {
  WarehousedProduct,
  type WarehouseInternalEvent,
} from "../inventoriedProduct.js";

export abstract class InventoryRepository<Meta>
  implements Repository<typeof WarehousedProduct, Meta>
{
  abstract hydrateEntity(entityId: string): Promise<
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
  >;
  abstract applyInternalEvents(
    entityId: string,
    internalEvents: WarehouseInternalEvent[],
    repositoryMeta: Meta
  ): Promise<void>;
}
