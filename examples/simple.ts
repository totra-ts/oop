import {
  Command,
  DomainEvent,
  Entity,
  FeatureFlag,
  InMemoryEventBus,
  InMemoryRepository,
  InternalEvent,
  InvariantError,
  Service,
  UseCase,
  ValidationError,
} from "../src/index";

type TaskInternalEvent =
  | InternalEvent<"TaskCreated", "1", { title: string }>
  | InternalEvent<"TaskTitleUpdated", "1", { title: string }>
  | InternalEvent<"TaskAssigned", "1", { userId: string }>
  | InternalEvent<"MakeTaskReoccuring", "1", {}>
  | InternalEvent<"TaskCompleted", "1", {}>;

type TaskDomainEvent = DomainEvent<
  "TaskCreated" | "TaskAssigned" | "TaskCompleted"
>;

type TaskState = {
  taskId: string;
  title: string;
  assignedUser?: string;
  isCompleted: boolean;
  isReoccuring: boolean;
};

class Task extends Entity<TaskInternalEvent, TaskDomainEvent> {
  protected state: TaskState;
  constructor(ctx: TaskState) {
    super();
    this.state = {
      ...ctx,
    };
  }

  reduceInternalEventsToDomainEvents(
    events: TaskInternalEvent[]
  ): TaskDomainEvent[] {
    return events.reduce((acc, next) => {
      switch (next.type) {
        case "TaskCreated":
          acc.push({
            event: "TaskCreated",
            entityId: this.state.taskId,
            eventId: this.state.taskId,
            timestamp: next.timestamp,
          });
          break;
        case "TaskAssigned":
          acc.push({
            event: "TaskAssigned",
            entityId: this.state.taskId,
            eventId: next.payload.userId,
            timestamp: next.timestamp,
          });
          break;
        case "TaskCompleted":
          acc.push({
            event: "TaskCompleted",
            entityId: this.state.taskId,
            eventId: this.state.taskId,
            timestamp: next.timestamp,
          });
        default:
          break;
      }
      return acc;
    }, [] as TaskDomainEvent[]);
  }
}

class CreateTaskCommand extends Command<"Task:Create", { title: string }> {
  constructor(p: { taskId: string; title: string }) {
    if (!p.title) {
      throw new ValidationError("Title is required");
    }

    super({
      type: "Task:Create",
      entityId: p.taskId,
      payload: {
        title: p.title,
      },
    });
  }
}

class CreateTask extends Task implements UseCase<CreateTaskCommand> {
  handle(command: CreateTaskCommand) {
    if (this.state.title) {
      throw new InvariantError("Task already exists.");
    }
    this.recordEvent({
      type: "TaskCreated",
      version: "1",
      payload: {
        title: command.payload.title,
      },
    });
  }
}

const inMemoryTaskRepository = new InMemoryRepository<typeof Task>(
  (id: string) => ({
    taskId: id,
    title: "",
    isCompleted: false,
    isReoccuring: false,
  }),
  (entity, event) => {
    switch (event.type) {
      case "TaskCreated":
        entity.title = event.payload.title;
        break;
      case "TaskTitleUpdated":
        entity.title = event.payload.title;
        break;
      case "MakeTaskReoccuring":
        entity.isReoccuring = true;
        break;
      case "TaskAssigned":
        entity.assignedUser = event.payload.userId;
        break;
      case "TaskCompleted":
        entity.isCompleted = true;
        break;
      default: {
        break;
      }
    }
    return entity;
  }
);

const inMemoryEventBus = new InMemoryEventBus();

const myTaskService = new Service<Task, typeof inMemoryTaskRepository>({
  entity: Task,
  repository: inMemoryTaskRepository,
  eventBus: inMemoryEventBus,
});

const enabledFF: FeatureFlag = {
  name: "enabled",
  enabled: async () => true,
};

myTaskService.register({
  requiredPolicies: ["task:create"],
  command: CreateTaskCommand,
  behavior: [[enabledFF, CreateTask]],
});

const main = async () => {
  await myTaskService.handle(
    new CreateTaskCommand({
      taskId: "1",
      title: "my todo",
    }),
    {
      policyId: "allow-creating-tasks",
      principal: "1",
      allow: new Set(["task:create"]),
    }
  );

  console.log(await inMemoryTaskRepository.hydrateReadOnlyEntity("1"));
};

main();
