import { InMemoryEventBus, InMemoryRepository, wait } from "../src/_testAids";

import { describe, expect, it } from "vitest";
import { DomainEvent } from "../src/DomainEvent";
import { PolicyOrchestrator } from "../src/PolicyOrchestrator";

describe("InMemoryEventBus", () => {
  it("correctly forwards events to subscribed policy orchestrators", async () => {
    const bus = new InMemoryEventBus();
    const policyOrchestrator = new PolicyOrchestrator();
    let event1FiredTimes = 0;
    let event2FiredTimes = 0;

    policyOrchestrator.registerPolicy("event1", () => {
      event1FiredTimes += 1;
    });

    policyOrchestrator.registerPolicy("event2", () => {
      event2FiredTimes += 1;
    });

    bus.subscribePolicyOrchestrator(policyOrchestrator);

    bus.publish(
      [
        { event: "event1" },
        { event: "event2" },
        { event: "event3" },
        { event: "event2" },
      ] as unknown as DomainEvent<string>[],
      null
    );

    await wait(10);

    expect(event1FiredTimes).toBe(1);
    expect(event2FiredTimes).toBe(2);
  });
});

describe("InMemoryRepository", () => {
  it("returns default if not present", async () => {
    const db = new InMemoryRepository(
      (id) => ({ id, happy: true }),
      () => {}
    );

    const r = await db.hydrateReadOnlyEntity("ZZZ");
    expect(r).toEqual({ id: "ZZZ", happy: true });
  });

  it("returns stored data if present", async () => {
    const db = new InMemoryRepository(
      (id) => ({ id, happy: true }),
      (entity, e) => {
        return {
          ...entity,
          happy: false,
        };
      }
    );

    await db.applyInternalEvents(
      "ZZZ",
      [{ type: "", payload: null, timestamp: Date.now(), version: "1" }],
      null
    );

    const r = await db.hydrateReadOnlyEntity("ZZZ");
    expect(r).toEqual({ id: "ZZZ", happy: false });
  });

  it("applies events as directed", async () => {
    const db = new InMemoryRepository(
      (id) => ({
        id,
        happy: true,
      }),
      (entity, event) => {
        return {
          ...entity,
          [event.type]: event.type,
        };
      }
    );

    await db.applyInternalEvents(
      "ZZZ",
      [
        { type: "sad", payload: null, timestamp: Date.now(), version: "1" },
        { type: "angry", payload: null, timestamp: Date.now(), version: "1" },
        {
          type: "confused",
          payload: null,
          timestamp: Date.now(),
          version: "1",
        },
      ],
      null
    );

    await db.applyInternalEvents(
      "ZZZ",
      [{ type: "happy", payload: null, timestamp: Date.now(), version: "1" }],
      null
    );

    expect(await db.hydrateReadOnlyEntity("ZZZ")).toEqual({
      id: "ZZZ",
      happy: "happy",
      sad: "sad",
      angry: "angry",
      confused: "confused",
    });
  });
});
