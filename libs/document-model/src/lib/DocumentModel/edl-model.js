import { missingEdlType } from "../well-known-objects";
import { addProperties, finalObject } from "@commonplace/utils";
import getClasses from "../Attributes/get-classes";

export function EdlModel(pointer, type, resolvedType, metalinks, zettel, links, parent, incomingPointers, defaultsLinks, key) {
  let containedSequences = [];

  let model = addProperties({}, {
    isEdl: true,
    pointer,
    type,
    zettel,
    links,
    markupRules: [],
    metaEndowmentRules: [],
    sequences: [],
    incomingPointers,
    defaultsLinks,
    key,
    markup: new Map(),
    contentMarkup: new Map(),
    resolvedType,
    metalinks,
    getClasses
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

export function MissingEdlReplacementModel(edlPointer, key) {
  return EdlModel(
    edlPointer,
    missingEdlType,
    missingEdlType.inlineText,
    [],
    [],
    [],
    undefined,
    [],
    {},
    key);
}
