import { addProperties, finalObject } from "@commonplace/utils";

export function Zettel(clip, incomingPointers, key) {
  let obj = addProperties({}, {
    isZettel: true,
    isClip: clip.isClip,
    pointer: clip,
    incomingPointers,
    sequences: [],
    key,
    markup: new Map(),
    contentMarkup: new Map()
  })

  return finalObject(obj, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat()
  });
}
