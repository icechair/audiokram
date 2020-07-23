export type Signal<TMessage> = (message: TMessage) => void;
export type Effect<TMessage> = (signal: Signal<TMessage>) => void;
export interface INext<TState, TMessage> {
  state: TState;
  effect?: Effect<TMessage>;
}

export type Update<TMessage, TState> = (
  message: TMessage,
  state: TState,
) => INext<TState, TMessage>;

export type View<TMessage, TState, TView = void> = (
  signal: Signal<TMessage>,
  state: TState,
) => TView;

export interface Program<TState, TMessage, TView = void> {
  init: INext<TState, TMessage>;
  update: Update<TMessage, TState>;
  view: View<TMessage, TState, TView>;
}
