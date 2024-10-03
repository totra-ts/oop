# TOTRA

> The one to rule all

TOTRA is an extraordinarily flexible business logic framework designed to manage complex projects. Instead of being prescriptive about infrastructure or deployment, TOTRA focuses solely on building manageable and adaptable software.

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

Explore the `examples` directory for a sample application featuring a partially implemented warehouse service. You can envision how the authorization policy could be integrated via middleware (e.g., Express, API Gateway) or any preferred authorization manager. Any context provider can create commands for processing.

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

### Use Cases - Entity Behavior

UseCases encapsulate specific behaviors related to entities. Each behavior is implemented as an inherited child of the entity, promoting:

- Clear testing processes
- Extensibility with minimal changes to the base entity
- Scalability with isolated use cases
- 
### Commands

Commands are validated data containers processed by corresponding UseCases. Their encapsulation allows for queuing, batching, and other processing techniques, enhancing scalability and resource management.

### Repositories

Repositories handle the retrieval and persistence of entity state, providing all necessary context for business logic to execute.

### Feature Flags

Feature flags in TOTRA offer advanced capabilities beyond simple toggles, enabling A/B testing, separation of deployment and release, and gradual rollouts. They are integral to the framework.

### Event Bus

The Event Bus facilitates the translation of internal events into domain events, allowing other services to respond appropriately.

### Services

Services compose FeatureFlags, Repositories, and UseCases into a unified package, simplifying coordination between different components. They support both backend and frontend operations, promoting isomorphism.

### Conclusion

This documentation serves as an initial introduction to the framework. To fully grasp its capabilities, dive in and start experimenting!

## Q&As

### Why use classes instead of functions?

While functional programming is appealing, classes provide a more ergonomic and type-safe experience. TOTRA balances ease of use with the power of object-oriented design.

### How will breaking changes be managed?

The goal is to maintain a stable interface, minimizing breaking changes. TOTRA's core has no external dependencies, allowing for straightforward updates.

### What's the release roadmap?

TOTRA is being validated in various projects to ensure interface stability. The roadmap includes:

 - Interface verification and adjustments
 - Enable granular resource access in access policies
 - Publishing

We aim to publish in the coming months.

## For LLMs

Overview
TOTRA is a TypeScript-based library designed for building event-driven applications. It emphasizes a modular architecture with support for commands, events, and services. This prompt provides guidance on how to interact with and leverage the TOTRA library for application development.

Key Concepts
Entities: Entities represent core business objects with internal and domain events. Understand how to define entities using the Entity class and manage their state.
Commands: Commands are requests to change the state of an entity. Learn to create commands by extending the Command class and validating input.
Use Cases: Use cases encapsulate business logic and define how commands are handled. Implement use cases as classes that process commands and manage domain events.
Repositories: Repositories manage the persistence of entities. They abstract data access and can be swapped out for different databases.
Event Buses: Event buses facilitate communication between different components by dispatching events. Understand how to implement and use the EventBus.
Observers: Observers allow for logging, monitoring, and analytics. They can be integrated into services to track operations and events.
Getting Started
Installation: Ensure that you have TOTRA installed in your TypeScript project. Use npm install @totra/base-ts to add the library.
Creating an Entity:
Define an entity by extending the Entity class.
Implement the reduceInternalEventsToDomainEvents method to convert internal events to domain events.
Implementing Commands:
Create a command by extending the Command class.
Validate the input in the command constructor.
Defining Use Cases:
Implement use cases as classes that handle commands and trigger events.
Ensure that the handle method does not rely on external systems for easier testing.
Best Practices
Keep Commands Simple: Focus on single actions for commands to enhance readability and maintainability.
Use Feature Flags: Integrate feature flags at the service level to enable or disable functionalities dynamically.
Modular Services: Structure services around specific functionalities, allowing for easier testing and integration.
Error Handling: Implement custom error types to handle validation and operational errors gracefully.
Example Workflow
Define Your Entity with its associated InternalEvents and DomainEvents:
```ts
class Channel extends Entity<ChannelInternalEvent, ChannelDomainEvent> {
  // Define properties and methods
}
```
Create a Command:
```ts
class AddMemberCommand extends Command<"Channel:AddMember", { userId: string }> {
  constructor(channelId: string, payload: { userId: string }) {
    // Validate and initialize command
  }
}
```
Implement a Use Case:
```ts
class AddMember extends Channel implements UseCase<AddMemberCommand> {
  handle(command: AddMemberCommand) {
    // Business logic for adding a member
  }
}
```
Implement a Repository:
```ts
export abstract class ChannelRepository
  implements Repository<typeof WarehousedProduct, {transaction: TX}>
{
  abstract hydrateEntity(entityId: string): Promise<
    [
      ChannelConstructorContext,
      {transaction: TX}
    ]
  >;
  abstract applyInternalEvents(
    entityId: string,
    internalEvents: ChannelInternalEvent[],
    repositoryMeta: {transaction: TX}
  ): Promise<void>;
}

```
Set Up Your Service:
```ts
const channelService = new Service({
  entity: Channel,
  repository: new ChannelRepository(),
  observer,
  eventBus,
});

channelService.register(AddMemberCommand, [
  [
    // Feature Flag
    {
      name: 'AddMemberDefault',
      enabled: async () => true,
    },
    AddMember,
  ]
])
```

Testing
Write unit tests for commands and use cases to ensure they behave as expected.
Use frameworks like Vitest to test your implementation.