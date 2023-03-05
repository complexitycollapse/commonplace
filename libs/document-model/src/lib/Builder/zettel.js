import { addProperties, finalObject } from "@commonplace/utils";

export function Zettel(clip, incomingPointers, key) {
  let obj = addProperties({}, {
    clip,
    pointer: clip,
    incomingPointers,
    sequences: [],
    key
  })

  return finalObject(obj, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat()
  });
}
