/**
 *
 * @param {import("./types.d.ts").AppSignal} signal
 */
export const tick = (signal) =>
  setInterval(() => signal({ type: "tick" }), 1000);
