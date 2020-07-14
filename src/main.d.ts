import {
  Signal,
  INext,
  Program,
} from "https://cdn.jsdelivr.net/gh/icechair/deno-ulmen@master/mod.d.ts";
import { TemplateResult } from "https://unpkg.com/lit-html?module";

export interface AppState {
  counter: number;
}

export interface SetCounter {
  type: "setCounter";
  payload: number;
}
export interface Tick {
  type: "tick";
}

export type AppMessage = SetCounter | Tick;
export type AppSignal = Signal<AppMessage>;
export type AppNext = INext<AppState, AppMessage>;
export type AppProgram = Program<AppState, AppMessage, TemplateResult>;
