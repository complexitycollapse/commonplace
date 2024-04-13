export function serializeEdl(model) {
  let links = Array.from(model.links.values(), serializeLink);
  let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
  let sequences = model.sequences.map(serializeSequence);
  let rootSequences = model.rootSequences().map(serializeSequence);
  let zettel = model.zettel.map(serializeZettel);

  return {
    key: model.key,
    type: model.type,
    pointer: model.pointer,
    zettel,
    links,
    incomingPointers,
    sequences,
    rootSequences,
    markup: serializeMarkup(model.markup),
    contentMarkup: serializeMarkup(model.contentMarkup),
    classes: model.getClasses().map(c => c.pointer.linkName),
    markupRules: model.markupRules.map(markupRule).filter(x => x)
  };
}

function markupRule(markupRule) {
  return {
    name: markupRule.attributeDescriptors.map(d => `${d.attribute}=${d.value}`).join(", "),
    attributes: markupRule.attributeDescriptors,
    immediateTargets: markupRule.immediateTargets,
    clipTypes: markupRule.clipTypes,
    edlTypes: markupRule.edlTypes,
    linkTypes: markupRule.linkTypes,
    classes: markupRule.classes
  };
}

function serializeZettel(model) {
  if (model.isEdl) { return serializeEdl(model); }
  else { return serializeAtom(model) };
}

export function serializeAtom(model) {
  let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
  let sequences = model.sequences.map(s => linkName(s.definingLink));

  return {
    key: model.key,
    pointer: model.pointer,
    incomingPointers,
    sequences,
    markup: serializeMarkup(model.markup),
    contentMarkup: serializeMarkup(model.contentMarkup),
    classes: model.getClasses().map(c => c.pointer.linkName)
  };
}

export function serializeLink(model) {
  let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
  let sequences = model.sequences.map(s => linkName(s.definingLink));
  let ends = model.ends.map(serializeEnd);

  return {
    key: model.key,
    name: linkName(model),
    type: model.type,
    ends,
    incomingPointers,
    sequences,
    markup: serializeMarkup(model.markup),
    contentMarkup: serializeMarkup(model.contentMarkup),
    classes: model.getClasses().map(c => c.pointer.linkName),
    markupRule: model.markupRule ? true : false
  };
}

function serializeEnd(model) {
  return {
    name: model.name,
    pointers: model.pointers,
    sequencePrototypes: model.sequencePrototypes.map(serializeSequencePrototype)
  };
}

function serializeSequencePrototype(prototype) {
  return {
    type: prototype.type,
    signature: {
      linkPointer: prototype.linkPointer,
      metalinkPointer: prototype.metalinkPointer
    }
  };
}

function serializeIncomingPointer(model) {
  return {
    end: model.end.name ?? "(Unnamed)",
    link: linkName(model.link)
  };
}

export const linkName = model => {
  let name = model.pointer.linkName;
  if (model.resolvedType) {
    if (typeof model.resolvedType === "string") {
      name = name + " (" + model.resolvedType + ")";
    }
    if (model.resolvedType.isLink) {
      name = name + " (" + model.resolvedType.getEnd("name").pointers[0].inlineText + ")";
    }
  }
  return name;
}

const serializeMarkup = m => Object.fromEntries(m.entries());

export function serializeSequence(sequence) {
  return {
    name: linkName(sequence.definingLink),
    key: sequence.key,
    definingLink: serializeLink(sequence.definingLink),
    signature: sequence.signature,
    type: sequence.type,
    members: sequence.members.map(member => member.isSequence ? serializeSequence(member) : member.pointer),
    isSubordinated: sequence.isSubordinated
  };
}
