import { html } from "../deps.js";
import { withRender } from "../lib/ulm/render.js";
import { mapEffect, mapSignal } from "../lib/ulm/runtime.js";
import { Counter } from "./counter/counter.js";

/**
 *
 * @param {*} message
 */
const counterMessage = (message) => ({
  type: "counterMessage",
  payload: message,
});

/**
 *
 * @param {*} message
 */
const timerMessage = (message) => ({
  type: "timerMessage",
  payload: message,
});

export const App = withRender(() => {
  const counter = Counter(13);
  const timer = Counter(0);
  const init = {
    state: {
      counter: counter.init.state,
      timer: timer.init.state,
    },
  };

  /**
   *
   * @param {*} msg
   * @param {*} state
   */
  const update = (msg, state) => {
    if (msg.type == "counterMessage") {
      const cNext = counter.update(msg.payload, state.counter);
      state.counter = cNext.state;
      return { state, effect: mapEffect(cNext.effect, counterMessage) };
    }
    if (msg.type == "timerMessage") {
      const tNext = timer.update(msg.payload, state.timer);
      state.timer = tNext.state;
      return { state, effect: mapEffect(tNext.effect, timerMessage) };
    }
    return { state };
  };

  /**
   *
   * @param {*} signal
   * @param {*} state
   */
  const view = (signal, state) => {
    return html`
      <h1>APP</h1>
      ${counter.view(mapSignal(signal, counterMessage), state.counter)}
      ${timer.view(mapSignal(signal, timerMessage), state.timer)}
    `;
  };

  return { init, update, view };
});
