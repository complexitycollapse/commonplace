import { addProperties, finalObject, memoize } from "@commonplace/utils";
import { getClasses, hasClasses, getLevels } from "../class-mixins.js";

export function Zettel(clip, parentModel, incomingPointers, key) {
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
    getClasses,
    hasClasses,
    getLevels: memoize(() => getLevels.apply(obj)),
    getContainers: () => [parentModel].concat(obj.sequences)
  })

  return finalObject(obj, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat()
  });
}
