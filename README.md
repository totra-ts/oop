# TOTRA

> The one to rule all

A extraordinarily flexible business logic framework to help manage complicated projects.

Rather than being prescriptive about infrastructure, deployment, or infrastructure, the only focus here is building easy to manage software.

# The TLDR

See `examples` for a sample application with a warehouse service partially implemented, and an app that is directly consuming the service. You can imagine how the authorizer policy could come from an Express middleware, API Gateway authorizer, or your preferred authorization manager of choice.

And... anything that can provide context can create these commands and send them up for consumption.

# The longer road

This came about while exploring varying methods for having an inversion of control. Perhaps unsurprising, the resulting choice looks fairly similar to Uncle Bob's Clean Architecture, albeit with a few minor deviations.

### Entities: The Core

At the core of the application is an entity.

What is an entity? It is a unified collection of things that change together in response to relevant commands.

How's that for cryptic? Every word is intentional, however.

Consider the difference between these 2 layouts:

**Layout 1**

```ts
class Product {
  name
  sku
  inventoryOnHand
}
class Cart {
  userId
  expiresAt
}
class CartItem {
  cartId
  productId
  quantity
}
class User {
  name
  type
}
```

**Layout 2**
```ts
class WarehousedProduct {
  productId
  lots
    id
    locations
      id
      quantityOnHand
      quantityOnHold
}

class UserCart {
  userId
  expiresAt
  items
    productId
    quantity
}

class ProductCatalog {
  productId
  name
  description
  photos
}
```

What's the difference?

Both have similar attributes - they both discuss product for example. However, the context is very different. One tries to split the project into Nouns. The other splits the project into Collections of Behavior (Entities).

Moving from Nouns to Entities is challenging at first, especially if you are used to normalized relational database schemas. However, splitting in this manner enables greater performance, improved observability, and more opportunities to scale.

With that distinction out of the way, entities have a few core responsibilities:

1. Define the necessary context - what is needed to start working with this entity?
2. Validate / map context into live state
3. Define the internal events - what are the primary ways this entity can change?
4. Define the domain events - what are the events other entities would care about?

In the framework, here's how that `WarehousedProduct` might look as an entity.

```ts
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
    }[];
  };

  constructor(context: {
    id: string;
    lotTransactions: {
      id: string;
      location: string;
      quantityIn: number;
      quantityOut: number;
    }[];
  }) {
    super();
    // validate / map context into state
    this.state = context;
  }

    reduceInternalEventsToDomainEvents(
    events: WarehouseInternalEvent[]
  ): WarehouseDomainEvent[] {
    // map internal to domain
    return []
  }
}
```

In this example, we can see that there doesn't necessarily need to be a 1:1 mapping of context to internal state. This makes pivoting between context models significantly easier.

The constructor in the entity will perform any necessary validations on the context to ensure the context is valid.

That leads us into the next portion of the framework - `UseCase`.

### UseCase - Entity Behavior

It might have looked odd to see a class with very little behavior on it. In reality, common shared, protected functions could absolutely be on the class, but that's not where the core behaviors will live.

Instead, we will implement each behavior as an inherited child of the Entity.

WAT?

First, let's look at the code:

```ts
class ReceiveInventory implements UseCase<typeof WarehousedProduct> {
  handle(command: ReceiveInventoryCommand) {
    // do stuff
  }
}
```

So... we only have a single method, handle which accepts a single parameter, command. Why the heck are we doing this?

Well... there's a few reasons for the madness:

1. Testing. It makes it abundantly clear what the class is, and how to test it.
2. Extensible. We can add as many use cases as we want and never need to touch the base entity class.
3. Scalable. Isolating each use case makes it easy to have variants and swap them out.

### Commands

