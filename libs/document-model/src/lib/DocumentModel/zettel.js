import { addProperties, finalObject } from "@commonplace/utils";
import getClasses from "../Attributes/get-classes";

export function Zettel(clip, incomingPointers, key) {
  let originContentPart = undefined;

  let obj = addProperties({}, {
    isZettel: true,
    isClip: clip.isClip,
    pointer: clip,
    incomingPointers,
    sequences: [],
    key,
    markup: new Map(),
    contentMarkup: new Map(),
    getContent: () => originContentPart?.content,
    setOriginContentPart: part => originContentPart = part,
    getClasses
  })

  return finalObject(obj, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat()
  });
}
