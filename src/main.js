import { App } from "./app/mod.js";
import { runtime } from "./lib/ulm/runtime.js";
//@ts-ignore
if (typeof document !== "undefined") {
  //@ts-ignore
  const r = runtime(App(document.body));
  r.start();
}
