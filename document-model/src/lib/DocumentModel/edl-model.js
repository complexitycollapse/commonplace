import { missingEdlType } from "../well-known-objects.js";
import { addProperties, finalObject, memoize } from "@commonplace/utils";
import { getClasses, hasClass, getLevels } from "../class-mixins.js";

export function EdlModel(pointer, type, resolvedType, metalinks, zettel, links, parent, incomingPointers, defaultsLinks, key) {
  let containedSequences = [];

  let model = addProperties({}, {
    isEdl: true,
    pointer,
    type,
    zettel,
    links,
    markupRules: [],
    sequences: [],
    incomingPointers,
    defaultsLinks,
    key,
    markup: new Map(),
    contentMarkup: new Map(),
    resolvedType,
    metalinks,
    getClasses,
    hasClass,
    getLevels: memoize(() => getLevels.apply(model)),
    getContainers: () => parent ? [parent].concat(model.sequences) : model.sequences
  });
  Object.defineProperty(model, "parent", { value: parent, enumerable: false});
  return finalObject(model, {
    sequencePrototypes: () => incomingPointers.map(p => p.end.sequencePrototypes).flat(),
    setContainedSequences: sequences => containedSequences = sequences,
    rootSequences: () => {
      let roots = containedSequences.filter(s => !s.isSubordinated);
      return roots;
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
