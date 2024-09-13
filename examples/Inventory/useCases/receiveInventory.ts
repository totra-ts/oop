import { Command } from "../../../src/Command.js";
import { ValidationError } from "../../../src/Errors.js";
import type { UseCase } from "../../../src/UseCase.js";
import { WarehousedProduct } from "../inventoriedProduct.js";

export class ReceiveInventoryCommand extends Command<
  "Warehouse:ReceiveInventory",
  { lotId: string; location: string; quantity: number }
> {
  constructor(
    productId: string,
    payload: { lotId: string; location: string; quantity: number }
  ) {
    if (payload.quantity < 0) {
      throw new ValidationError("Quantity must be greater than 0");
    }
    super("Warehouse:ReceiveInventory", productId, payload, [
      "warehouse:receive-product",
    ]);
  }
}

export class ReceiveInventory
  extends WarehousedProduct
  implements UseCase<ReceiveInventoryCommand>
{
  handle(command: ReceiveInventoryCommand) {
    const lot = this.state.lots.find(
      (a) =>
        a.id === command.payload.lotId &&
        a.location === command.payload.location
    );

    if (!lot) {
      this.state.lots.push({
        id: command.payload.lotId,
        location: command.payload.location,
        quantity: command.payload.quantity,
        onHoldQuantity: 0,
      });

      this.recordEvent({
        type: "NewInventoryLotLocation",
        version: "1",
        timestamp: Date.now(),
        payload: {
          lotId: command.payload.lotId,
          location: command.payload.location,
        },
      });
    } else {
      lot.quantity += command.payload.quantity;
    }

    this.recordEvent({
      type: "InventoryReceived",
      version: "1",
      timestamp: Date.now(),
      payload: {
        lotId: command.payload.lotId,
        location: command.payload.location,
        quantity: command.payload.quantity,
      },
    });
  }
}
