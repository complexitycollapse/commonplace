import { addProperties, finalObject } from "@commonplace/utils";

export function EdlModel(pointer, type, zettel, links, parent, incomingPointers) {
  let model = addProperties({}, {
    pointer,
    type,
    zettel,
    links,
    markupRules: [],
    metaEndowmentRules: [],
    metaSequenceRules: [],
    sequences: [],
    incomingPointers
  });
  Object.defineProperty(model, "parent", { value: parent, enumerable: false});
  return finalObject(model, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat()
  });
}