import { TemplateResult } from "../deps.js";
import * as ulm from "../lib/ulm/types.d.ts";

export interface AppState {
  counter: number;
  ticking: boolean;
}

export interface Tick {
  type: "tick";
}

export type AppMessage = Tick;
export type AppNext = ulm.INext<AppState, AppMessage>;
export type AppSignal = ulm.Signal<AppMessage>;
export type AppUpdate = ulm.Update<AppMessage, AppState>;
export type AppView = ulm.View<AppState, AppMessage, TemplateResult>;
