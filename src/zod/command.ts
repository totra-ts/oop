import { type input, type infer as ZInfer, type ZodTypeAny } from "zod";
import { Command } from "../Command.js";
import { ValidationError } from "../Errors.js";
import type { ClassType } from "../_types.js";

export const zodCommand = <Type extends string, Schema extends ZodTypeAny>(p: {
  type: Type;
  schema: Schema;
  entityId: (p: ZInfer<Schema>) => string;
}): new (props: input<Schema>) => Command<Type, ZInfer<Schema>> => {
  return class extends Command<Type, ZInfer<Schema>> {
    constructor(props: input<Schema>) {
      const parsed = p.schema.safeParse(props);
      if (!parsed.success) throw new ValidationError(parsed.error.message);
      super({
        type: p.type,
        entityId: p.entityId(parsed.data as ZInfer<Schema>),
        payload: parsed.data as ZInfer<Schema>,
      });
    }
  };
};

export type ZodCommandType<T extends ReturnType<typeof zodCommand>> =
  InstanceType<T>;
export type ZodCommandClassType<T extends ReturnType<typeof zodCommand>> =
  ClassType<ZodCommandType<T>>;
