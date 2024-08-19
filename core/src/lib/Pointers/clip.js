import { addProperties, addMethods } from "@commonplace/utils";
import { Pointer } from "./pointer.js";

export function Clip(pointerType, origin, partBuilder, hashableNameFn, originalContext) {
  let obj = Pointer(pointerType, true, true, () => origin, partBuilder, hashableNameFn);

  addProperties(obj, {
    isLink: false,
    originalContext
  });

  addMethods(obj, {
    equalOrigin: clip => clip.origin == origin,
    endowsTo: clip => obj.overlaps(clip)
  });

  return obj;
}

export function compareOriginalContexts(actual, expected) {
  if (actual.originalContext === undefined) {
    return expected.originalContext === undefined;
  } else {
    return expected.originalContext !== undefined &&
      actual.originalContext.denotesSame(expected.originalContext);
  }
}
