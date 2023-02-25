import { addProperties, finalObject } from "@commonplace/utils";

export function Zettel(clip, incomingPointers) {
  let obj = addProperties({}, {
    clip,
    pointer: clip,
    incomingPointers,
    sequences: []
  })

  return finalObject(obj, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat()
  });
}
