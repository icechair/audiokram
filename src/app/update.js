import { tick } from "./effects.js";

/**
 * @returns {import("./types.d.ts").AppNext}
 */
export const initialState = () => ({
  state: {
    counter: 0,
    ticking: false,
  },
  effect: tick,
});
/**
 *
 * @param {import("./types.d.ts").AppMessage} msg
 * @param {import("./types.d.ts").AppState} state
 */
export const update = (msg, state) => {
  if (msg.type == "tick") {
    state.counter += 1;
    return { state };
  } else {
    return { state };
  }
};
