import type { ClassType, RepositoryMeta } from "../../src/_types.js";
import type { EventBus } from "../../src/EventBus.js";
import type { Observer } from "../../src/Observer.js";
import type { Repository } from "../../src/Repository.js";
import { Service } from "../../src/Service.js";
import { WarehousedProduct } from "./inventoriedProduct.js";
import {
  ReceiveInventory,
  ReceiveInventoryCommand,
} from "./useCases/receiveInventory.js";

export const createInventoryService = <
  R extends Repository<ClassType<WarehousedProduct>, any>
>(p: {
  repository: R;
  eventBus: EventBus<RepositoryMeta<R>>;
  observer?: Observer;
}) => {
  const inventoryService = new Service<WarehousedProduct, R>({
    repository: p.repository,
    eventBus: p.eventBus,
    observer: p.observer,
  });

  inventoryService.register(ReceiveInventoryCommand, [
    [
      {
        name: "RecieveInventory",
        enabled: async () => true,
      },
      ReceiveInventory,
    ],
  ]);

  return inventoryService;
};
