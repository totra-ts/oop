import { PolicyOrchestrator } from "../src/PolicyOrchestrator.js";
import { createInventoryService } from "./Inventory/createInventoryService.js";
import { DemoInventoryRepository } from "./Inventory/repositories/demoInventoryRepository.js";
import { ReceiveInventoryCommand } from "./Inventory/useCases/receiveInventory.js";

const orchestrator = new PolicyOrchestrator();

orchestrator.registerPolicy("Warehouse:InventoryReceived", (d) => {
  console.log("POLICY ACTIVATED FOR", d.event, d.entityId);
});

const logger =
  (name: string) =>
  (...args: any[]) =>
    console.log(name, args.at(-1));

export const inventoryService = createInventoryService({
  repository: new DemoInventoryRepository(),
  eventBus: {
    publish: (events) => {
      console.log("eventbus", events);
      orchestrator.activate(events);
    },
  },
  observer: {
    recordCommand: logger("command"),
    recordDomainEvents: logger("domain events"),
    recordError: logger("error"),
    recordFeatureFlag: logger("feature flag"),
  },
});

inventoryService.handle(
  new ReceiveInventoryCommand("123", {
    lotId: "1",
    location: "A1",
    quantity: 10,
  }),
  {
    principal: {},
    policyId: "1",
    allow: new Set(["warehouse:receive-product"]),
  }
);
