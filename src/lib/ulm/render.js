import { render } from "../../deps.js";
/**
 * @template TState
 * @template TMessage
 * @template TView
 * @typedef {import("./types.d.ts").Program<TState,TMessage,TView>} Program
 */
/**
 * @typedef {import("../../deps.js").TemplateResult} TemplateResult
 */
/**
 * @template TState
 * @template TMessage
 * @typedef {import("./types.d.ts").Program<TState,TMessage,TemplateResult>} RenderableProgram
 */

/**
 * @template TState
 * @template TMessage
 * @param {()=>RenderableProgram<TState,TMessage> } createProgram
 * @returns {(container:*) => Program<TState,TMessage,void>}
 */
export function withRender(createProgram) {
  return (container) => {
    const { init, update, view } = createProgram();

    return {
      init,
      update,
      view: (signal, state) => {
        render(view(signal, state), container, {});
      },
    };
  };
}
