import { html } from "../deps.js";
/**
 *
 * @param {import("../main.d.ts").AppState} state
 */
export const view = (state) => html`<h1>${state.counter}</h1>`;
