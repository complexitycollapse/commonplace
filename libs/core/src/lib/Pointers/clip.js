import { ClipIterator } from "./clip-iterator";
import { addProperties, addMethods } from "../utils";
import { Pointer } from "./pointer";

export function Clip(clipType, origin, partBuilder, hashableNameFn, originalContext) {
  let obj = Pointer(clipType, true, () => origin, partBuilder, hashableNameFn);

  addProperties(obj, {
    clipType,
    isLink: false,
    originalContext,
    isTypePointer: false
  });

  addMethods(obj, {
    equalOrigin: clip => clip.origin == origin,
    clipSource: () => ClipIterator(x => x, [obj]),
    sameType: clip => clip.clipType === clipType,
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
