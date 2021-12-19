import { ClipIterator } from "./clip-iterator";
import { addProperties, addMethods } from "./utils";
import { Pointer } from "./pointer";

export function Clip(clipType, origin) {
  let obj = Pointer("clip", true);

  addProperties(obj, {
    clipType,
    origin
  });

  addMethods(obj, {
    equalOrigin: clip => clip.origin == origin,
    clipSource: () => ClipIterator(x => x, [obj]),
    sameType: clip => clip.clipType === clipType
  });

  return obj;
}
