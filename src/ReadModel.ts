export abstract class ReadModel<
  State extends unknown,
  Event extends unknown = unknown
> {
  protected state: State;

  constructor(initialState: State) {
    this.state = initialState;
  }

  handle(event: Event): ReadModel<State> {
    return this;
  }

  abstract getState(): Readonly<State>;
}
