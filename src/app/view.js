import { html } from "../deps.js";
/**
 *
 * @param {import("./types.d.ts").AppSignal} signal
 * @param {import("./types.d.ts").AppState} state
 */
export const view = (signal, state) => html`<h1>${state.counter}</h1>`;
