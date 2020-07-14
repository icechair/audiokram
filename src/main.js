import { CreateProgram } from "./app/mod.js";
import { withRender } from "./lib/render.js";
import { runtime } from "./deps.js";
//@ts-ignore
if (typeof document !== "undefined") {
  //@ts-ignore
  const app = withRender(document.body, CreateProgram);
  runtime(app);
}
