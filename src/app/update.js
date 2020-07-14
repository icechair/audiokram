/**
 *
 * @param {import("../main.d.ts").AppMessage} msg
 * @param {import("../main.d.ts").AppState} state
 */
export const update = (msg, state) => ({
  state: { counter: state.counter + 1 },
});
