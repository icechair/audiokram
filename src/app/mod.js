import { view } from "./view.js";
import { update, initialState } from "./update.js";
import { withRender } from "../lib/ulm/render.js";
import { vag } from "../deps.js";

export const App = withRender(() => {
  const init = initialState();
  return { init, update, view };
});
