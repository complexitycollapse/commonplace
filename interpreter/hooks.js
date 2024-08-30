import { ListMap } from "@commonplace/utils";

const hookMap = new ListMap();
let heldCalls = [];
let dropCalls, holdCalls;

export default function callHook(type, event) {
  if (dropCalls) { return; }
  const handlers = hookMap.get(type);
  handlers.forEach(handler => {
    try {
      if (holdCalls) {
        heldCalls.push(event);
      } else {
        handler(event);
      }
    } catch (e) {
      // Just swallow hook errors for now.
    }
  });
}

export function addHook(type, handler) {
  hookMap.push(type, handler);
}

export function stopHookCalls() {
  dropCalls = true;
}

export function holdHookCalls() {
  holdCalls = true;
}

export function resumeHookCalls() {
  dropCalls = false;
  holdCalls = false;
  const held = heldCalls;
  heldCalls = [];
  return held;
}
