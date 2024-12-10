# TOTRA

> The one to rule all

TOTRA is an extraordinarily flexible business logic framework designed to manage complex projects. Instead of being prescriptive about infrastructure or deployment, TOTRA focuses solely on building manageable and adaptable software.

## Installation

```
npm install / bun add / yarn add @totra/base-ts
```

For consistency's sake and to later support a more functional approach, this will likely change in the future to `@totra/oop`

## When NOT to Use TOTRA

- ❌ If your application is primarily CRUD with minimal business logic.
- ❌ If performance is your top priority (e.g., dev tools, MMORPGs).
- ❌ If your application primarily acts as a glue between services with minimal business logic.

While TOTRA is capable of handling CRUD and integration tasks, its core strengths lie in its design principles, which include:

- ✅ Easy to test
- ✅ Clear and understandable system fundamentals
- ✅ Seamless upgrades of external dependencies without impacting core logic
- ✅ Simplified rewrites of large application components without disrupting core logic
- ✅ A standardized format that helps LLMs understand the codebase, reducing context tokens
- ✅ First-class support for feature flags and authorization

TOTRA is built for software that leverages current innovations while remaining adaptable to future changes.

## Features

- **Modular Design**: Clearly defined roles for entities, use cases, repositories, and services promote separation of concerns, making the codebase easier to understand and maintain.
- **Type Safety**: Leveraging TypeScript's capabilities to provide strong typing throughout the library, enhancing developer experience with better autocompletion, error checking, and documentation.
- **Flexible and Extensible**: Easily swap out repositories and services to adapt to different storage solutions (e.g., PostgreSQL, MongoDB), allowing for seamless integration with various databases and external systems.
- **Built-in Validation**: Commands include validation logic to ensure only valid data is processed, helping to enforce business rules at the entry point of command handling.
- **Event-Driven Architecture**: Internal and domain events promote reactive handling of state changes, making the system scalable and efficient in processing asynchronous workflows.
- **Testability**: Encourages a test-driven development (TDD) approach, with easily testable modules that ensure the reliability and correctness of the application.
- **Custom Observers**: Integrate custom observers for logging, monitoring, and analytics, providing insights into application behavior and performance.

## TL;DR

Explore the `examples/simple.ts` file featuring a partially implemented todo service. You can envision how the authorization policy could be integrated via middleware (e.g., Express, API Gateway) or any preferred authorization manager.

## Overview

TOTRA is inspired by the principles of inversion of control and closely resembles Uncle Bob's Clean Architecture, with some deviations. The framework emphasizes the following core concepts:

### Entities: The Core

An **Entity** is a unified collection of elements that change in response to relevant commands. Entities are structured around collections of behavior, enhancing performance, observability, and scalability. Each entity has several responsibilities:

1. Define the necessary context for working with the entity.
2. Validate and map context into live state.
3. Define internal events that indicate how the entity can change.
4. Define domain events that other entities would care about.

Example of a `WarehousedProduct` entity:

```typescript
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
    // Validate / map context into state
    this.state = context;
  }

  reduceInternalEventsToDomainEvents(
    events: WarehouseInternalEvent[]
  ): WarehouseDomainEvent[] {
    // Map internal to domain
    return [];
  }
}
```

### Commands

Commands are validated data containers processed by UseCases. Their encapsulation allows for queuing, batching, and other processing techniques, enhancing scalability and resource management.

Commands can be written out as follows:

```ts
export class ChangeUserEmailCommand extends Command<"User:ChangeEmail", {email: string}> {
  constructor(p: {
    userId: string;
    payload: {
      email: string;
    };
  }) {
    validateEmail(p.payload.email) // input validation
    super({
      type: "User:ChangeEmail",
      entityId: p.userId,
      payload: p.payload,
    })
  }
}
```

Or, if you are using zod as a validator, they can be written as follows:

```ts
export const ChangeUserEmailCommand = zodCommand({
  type: "User:ChangeEmail", // Unique name of command for observation
  schema: z.object({      
    userId: z.string(),
    email: z.string().email(), // validation
  }),
  entityId: (p) => p.userId,   // mapping of schema to entityId
});
```

Crucially, data must be packaged into commands to ensure that the data has been sanitized, removing basic validation out of the business logic.


### Use Cases - Entity Behavior

UseCases encapsulate specific behaviors related to entities. Each behavior is implemented as an inherited child of the entity, promoting:

- Clear testing processes
- Extensibility with minimal changes to the base entity
- Scalability with isolated use cases

UseCases can be defined like this:

```ts
export class WriteOffInventory extends Warehouse implements UseCase<WriteOffInventoryCommand> {
  handle(command: WriteOffInventoryCommand) {
    if(stuff) {
      this.recordEvent({...})
    }
    this.recordEvent({...}) // Note multiple events may be emitted from the UseCase
  }
}
```

This makes writing tests exceptionally easy:

```ts
describe("WriteOffInventory", () => {
  it("does something if stuff", () => {
    // arrange
    const command = new WriteOffInventoryCommand({ ... })
    const useCase = new WriteOffInventory({ ... })
    // act
    useCase.handle(command)
    // assert
    const events = useCase.getInternalEvents()
    expect(events.map(event => event.type))
      .toEqual(['Removed', 'Moved'])
  }) 
})
```

### Repositories

Repositories handle the retrieval and persistence of entity state, providing all necessary context for business logic to execute.

They can be defined like this:

```ts
const repository: Repository<
typeof Warehouse, 
{ 
  // second type argument is provided by the user containing transaction details
  // in the case that you need acid compliance between reading and writing
  transaction: TX
}> = {
  // Utility function if you need to do a reverse look up from the service
  // Note that it does not return a transaction
  hydrateReadOnlyEntity: async (entityId) => {
    ...
    return warehouseData
  },
  // This is what the service calls to get the context to hydrate
  // the entity.
  hydrateEntity: async (entityId) => { 
    ...
    return [warehouseData, { transaction: dbTx }]
  },
  // This is what the service calls to translate events into a persisted
  // representation.
  applyInternalEvents: async (
    entityId, 
    events, 
    { transaction } // same transaction as returned from hydrate entity
  ) => {
    // apply events in the order they came in
    for(const event of events) {
      switch (event.type) {
        case 'Moved':
          ...
          break
        ...
      }
    }
  }
}
```

Not every database uses transactional context. In these cases, the repository can be made significantly more simple.

```ts
const repository = new SimpleRepository<typeof Warehouse>({
  hydrate: async (entityId) => {
    ...
    return warehouseData
  },
  applyEvents: async (entityId, events) => {
    // apply events in the order they came in
    for(const event of events) {
      switch (event.type) {
        case 'Moved':
          ...
          break
        ...
      }
    }
  }
})
```

### Feature Flags

Feature flags in TOTRA offer advanced capabilities beyond simple toggles, enabling A/B testing, separation of deployment and release, and gradual rollouts. They are integral to the framework.

How can they do that? By simply allowing you to dynamically decide
whether they are enabled or not on a per-user basis.

```ts
const betaUsersFF: FeatureFlag = {
  name: 'betaUsers',
  // This is where the magic happens
  // Given the principal from the auth policy,
  // determine whether the flag is enabled or not
  enabled: async (userId) => {
    return isUserABetaUser(userId)
  }
}
```

This allows you to do interesting things like a feature flag which
slowly adds more and more users to a new feature as they use the system.

```ts
const createSlowReleaseFlag = (name: string) => {
  name: 'slowRelease-' + name,
  enabled: async (userId) => {
    const cachedGroup = await isPartOfSubset(userId, name)
    if (cachedGroup === undefined) {
      if (Math.random() < 0.001) {
        await addToSubset(userId, name)
        return true
      } else {
        return false
      }
    }
    return cachedGroup
  },
}
```

Whether you ought to do that is a different story, but you've got the power here!

### Event Bus

The Event Bus facilitates the translation of internal events into domain events, allowing other services to respond appropriately.

```ts
const eventBus: EventBus<{
  transaction: TX // same TX as provided from repo, enabling the outbox pattern
}> = {
  publish: async (events, { transaction }) => {
    ...
  }
}
```

### Authorization Policies

To guard behaviors from users who should not have access, TOTRA uses an authorization policy construct. Defining a policy is simple:

```ts
type Agent = 
| {
  type: "system";
} 
| {
  type: "admin";
  email: string;
} 
| {
  type: "public";
  ip: string;
}
// Declaration merging happening here
export interface AuthorizationPolicyPrincipal {
  agent: Agent
}

const userAuthPolicy: AuthorizationPolicy = {
  policyId: "admin-user-policy",
  principal: {
    agent: {
      type: "admin",
      email: "email@example.com",
    }
  },
  // Allow is a set of permissions that the principal is allowed
  // to access. This is consumed by the service.
  allow: new Set(["admin:warehouse:write-off"]),
}
```

### Services

Services compose FeatureFlags, Repositories, and UseCases into a unified package, simplifying coordination between different components.

```ts
// This sets up all of the internal coordination
// and observation.
const warehouseService = new Service({
  entity: Warehouse,
  repository: warehouseRepository,
  eventBus: eventBus,
})

// Individual behaviors and commands need to be coupled
// with feature flags and required policies
warehouseService.register({
  // Required policies will be matched against the
  // provided auth policy to ensure the user has
  // access
  requiredPolicies: ['admin:warehouse:write-off'],
  // Lookups are using the pointer of the command's prototype
  // which, beyond being fast, ensures that the service will only
  // process commands which have been validated
  command: WriteOffInventoryCommand,
  behavior: [
    // If beta user, we will use the new behavior
    // Ultimately, the old one will likely be removed
    // once we are happy with the the new one
    [betaUsersFF, WriteOffInventory2],
    // enabledFF would always return true
    // to ensure that all non-beta users that have access
    // will be able to write off using the OG behavior 
    [enabledFF, WriteOffInventory]
  ]
})
```

Once a service has been defined and behaviors have been registered to it,
it's time to start using it!

```ts
await warehouseService.handle(
  new WriteOffInventoryCommand({
    ...
  }),
  userAuthPolicy
)
```

### Policy Orchestrator

The policy orchestrator listens to the event bus, and given domain events, will perform additional effects.

```ts
const orchestrator = new PolicyOrchestrator()

orchestrator.registerPolicy(
  "Inventory:WrittenOff",
  async (event) => {
    const authPolicy = {
      policyId: "InventoryWrittenOffPolicy",
      principal: { agent: { type: "system" } },
      allow: new Set("notification:send")
    }
    ...
    notificationService.handle(
      new NotifyInventoryWrittenOffCommand({
        ...
      })
    )
  },
)
```

Orchestrators enable business logic to be broken out from what needs to be transactionally / temporally coupled from what needs to happen in a sequence but not immediate.

### Conclusion

This documentation serves as an initial introduction to the framework. To fully grasp its capabilities, dive in and start experimenting!

## Q&As

### Why use classes instead of functions?

Why not both?

OOP seems to have more literature for these types of concepts, so we thought it would be best to start here and nail it, and then follow up with a functional version later.

### How will breaking changes be managed?

The goal is to maintain a stable interface, minimizing breaking changes. TOTRA's core has no external dependencies, allowing for straightforward updates.

The biggest question is naming conventions - we want this to be as intuitive as possible, and we think there are still some changes that could help with that.

### What's the release roadmap?

TOTRA is being validated in various projects to ensure interface stability. The roadmap includes:

- Integrate [Standard Schema](https://github.com/standard-schema/standard-schema?tab=readme-ov-file)
- Refine names
- Publish stable 1.0

We aim to publish in the coming months.