import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../src/Errors.js";
import {
  ReceiveInventory,
  ReceiveInventoryCommand,
} from "./receiveInventory.js";

describe("ReceiveInventoryCommand", () => {
  it("validates non-negative quantities are being used", () => {
    expect(
      () =>
        new ReceiveInventoryCommand("123", {
          lotId: "1",
          location: "A1",
          quantity: -1,
        })
    ).toThrowError(ValidationError);
  });

  it("passes on positive inventories", () => {
    const command = new ReceiveInventoryCommand("123", {
      lotId: "1",
      location: "A1",
      quantity: 1,
    });

    expect(command).toBeDefined();
  });
});

describe("ReceiveInventory", () => {
  it("sends `InventoryAdjusted, InventoryReceived` domain events when lot location didn't exist", () => {
    const useCase = new ReceiveInventory({
      id: "ABC",
      lots: [],
    });
    useCase.handle(
      new ReceiveInventoryCommand("123", {
        lotId: "1",
        location: "A1",
        quantity: 1,
      })
    );
    expect(useCase.getDomainEvents()).toEqual([
      { entityId: "ABC", event: "Warehouse:InventoryAdjusted" },
      { entityId: "ABC", event: "Warehouse:InventoryReceived" },
    ]);
  });

  it("sends `InventoryReceived` domain events when lot location does exist", () => {
    const useCase = new ReceiveInventory({
      id: "ABC",
      lots: [
        {
          id: "1",
          location: "A1",
          quantity: 1,
          onHoldQuantity: 0,
        },
      ],
    });
    useCase.handle(
      new ReceiveInventoryCommand("123", {
        lotId: "1",
        location: "A1",
        quantity: 1,
      })
    );
    expect(useCase.getDomainEvents()).toEqual([
      { entityId: "ABC", event: "Warehouse:InventoryReceived" },
    ]);
  });
});
