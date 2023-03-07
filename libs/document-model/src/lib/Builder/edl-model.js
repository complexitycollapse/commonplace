import { addProperties, finalObject } from "@commonplace/utils";

export function EdlModel(pointer, type, zettel, links, parent, incomingPointers, defaultsLinks, key) {
  let containedSequences = [];

  let model = addProperties({}, {
    pointer,
    type,
    zettel,
    links,
    markupRules: [],
    metaEndowmentRules: [],
    metaSequenceRules: [],
    sequences: [],
    incomingPointers,
    defaultsLinks,
    key,
    markup: {},
    contentMarkup: {}
  });
  Object.defineProperty(model, "parent", { value: parent, enumerable: false});
  return finalObject(model, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat(),
    setContainedSequences: sequences => containedSequences = sequences,
    rootSequences: () => {
      return containedSequences.filter(s => !s.isSubordinated);
    }
  });
}
