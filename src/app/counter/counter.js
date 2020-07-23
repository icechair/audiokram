import { html } from "../../deps.js";
/**
 * @typedef {{type:string,payload?:*}} Message
 * @typedef {(message:Message) => void} Signal
 */

function TickSubscription(interval = 1000) {
  /**@type {number} */
  let timer;
  /**
   *
   * @param {Signal} signal
   */
  const subscribe = (signal) => {
    if (!timer) {
      timer = setInterval(() => signal({ type: "tick" }), interval);
    }
  };
  /**
   *
   * @param {Signal} signal
   */
  const cancel = (signal) => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
  };
  return { subscribe, cancel };
}

export function Counter(count = 0) {
  const init = {
    state: {
      count,
      started: false,
    },
  };
  const tickSubscription = TickSubscription();

  /**
   *
   * @param {Message} msg
   * @param {typeof init.state} state
   */
  const update = (msg, state) => {
    switch (msg.type) {
      case "tick": {
        if (state.started) {
          state.count += 1;
        }
        return { state };
      }
      case "toggle": {
        let effect;
        if (state.started) {
          effect = tickSubscription.cancel;
        } else {
          effect = tickSubscription.subscribe;
        }
        state.started = !state.started;
        return { state, effect };
      }
      case "reset": {
        state.count = count;
        state.started = false;
        const effect = tickSubscription.cancel;
        return { state, effect };
      }
    }
    return { state };
  };

  /**
   *
   * @param {Signal} signal
   * @param {typeof init.state} state
   */
  const view = (signal, state) => {
    return html`
      <div class="counter">
        <div class="count">${state.count}</div>
        <button @click=${() => signal({ type: "toggle" })}>
          ${state.started ? "⏸️" : "▶️"}
        </button>
        <button @click=${() => signal({ type: "reset" })}>⏹️</button>
      </div>
    `;
  };

  return { init, update, view };
}
