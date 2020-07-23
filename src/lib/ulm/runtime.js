/**
 * @template TState
 * @template TMessage
 * @template TView
 * @param {import("./types.d.ts").Program<TState,TMessage,TView>} program
 */
export const runtime = (program) => {
  const { init, update, view } = program;
  let running = false;
  /**
   * @type {TState}
   */
  let current;
  /**
   * @param {TMessage} message
   */
  const signal = (message) => change(update(message, current));

  /**
   *
   * @param {import("./types.d.ts").INext<TState,TMessage>} next
   */
  const change = (next) => {
    if (!running) return;
    const { state, effect } = next;
    current = state;
    if (effect) setTimeout(() => effect(signal), 0);
    view(signal, state);
  };

  const start = () => {
    running = true;
    change(init);
  };
  const stop = () => {
    running = false;
  };
  return { start, stop };
};
