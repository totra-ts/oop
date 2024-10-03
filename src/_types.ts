import type { Entity } from "./Entity.js";

export interface ClassType<T> extends Function {
  new (...args: any[]): T;
}

export type EntityClassInternalEvents<E> = E extends ClassType<
  Entity<infer InternalEvents, any>
>
  ? InternalEvents
  : never;

// Note - this is ugly, but conditioning off the repository
// interface way didn't seem to clear
export type RepositoryMeta<R> = R extends {
  applyInternalEvents: (a: any, b: any, c: infer T) => any;
}
  ? T
  : never;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
