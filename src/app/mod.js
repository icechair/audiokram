import { view } from "./view.js";
import { update } from "./update.js";

/**
 *
 * @param {import("../main.d.ts").AppSignal} signal
 */
const effect = (signal) => setInterval(() => signal({ type: "tick" }), 1000);
const getInit = () => ({ state: { counter: 0 }, effect });
export const CreateProgram = () => {
  const init = getInit();
  return { init, update, view };
};
