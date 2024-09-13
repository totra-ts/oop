import { Command } from "./Command.js";

export interface UseCase<T extends Command<string, unknown>> {
  handle: (command: T) => void;
}
