import { render } from "../deps.js";
/**
 * @param {*} container HTMLElement
 * @param {()=>import("../main.d.ts").AppProgram} createProgram
 */
export const withRender = (container, createProgram) => {
  const program = createProgram();
  const { init, update } = program;
  /**
   *
   * @param {import("../main.d.ts").AppState} state
   * @param {import("../main.d.ts").AppSignal} signal
   */
  const view = (state, signal) => {
    render(program.view(state, signal), container, null);
  };
  return {
    init,
    update,
    view,
  };
};
