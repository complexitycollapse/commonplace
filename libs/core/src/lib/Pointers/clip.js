import { ClipIterator } from "./clip-iterator";
import { addProperties, addMethods } from "../utils";
import { Pointer } from "./pointer";

export function Clip(clipType, origin, partBuilder, originalContext) {
  let obj = Pointer("clip", true, () => origin, partBuilder);

  addProperties(obj, {
    clipType,
    isLink: false,
    originalContext
  });

  addMethods(obj, {
    equalOrigin: clip => clip.origin == origin,
    clipSource: () => ClipIterator(x => x, [obj]),
    sameType: clip => clip.clipType === clipType
  });

  return obj;
}