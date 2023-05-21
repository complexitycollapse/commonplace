export function serializeEdl(model) {
  let links = Object.values(model.links).map(serializeLink);
  let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
  let sequences = model.sequences.map(s => linkName(s.definingLink));
  let zettel = model.zettel.map(serializeZettel);

  return {
    key: model.key,
    type: model.type,
    pointer: model.pointer,
    zettel,
    links,
    incomingPointers,
    sequences,
    markup: markup(model.markup),
    contentMarkup: markup(model.contentMarkup),
    classes: model.getClasses().map(c => c.pointer.linkName),
    rules: {
      markup: model.markupRules.map(markupRule).filter(x => x),
      metaEndowments: links.map(metaEndowmentRule).filter(x => x)
    }
  };
}

function markupRule(markupRule) {
  return {
    attributes: markupRule.attributeDescriptors,
    targets: markupRule.targets,
    clipTypes: markupRule.clipTypes,
    edlTypes: markupRule.edlTypes,
    linkTypes: markupRule.linkTypes,
    classes: markupRule.classes
  };
}

function metaEndowmentRule(link) {
  if (link.metaEndowmentRule) {
    return {
      link: linkName(link),
      end: link.metaEndowmentRule.end,
      attributes: link.metaEndowmentRule.attributeDescriptors,
      targets: link.metaEndowmentRule.targets,
      clipTypes: link.metaEndowmentRule.clipTypes,
      edlTypes: link.metaEndowmentRule.edlTypes,
      linkTypes: link.metaEndowmentRule.linkTypes
    };
  }
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
    markup: markup(model.markup),
    contentMarkup: markup(model.contentMarkup),
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
    markup: markup(model.markup),
    contentMarkup: markup(model.contentMarkup),
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
    end: model.end.name,
    link: linkName(model.link)
  };
}

const linkName = model => {
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

const markup = m => Object.fromEntries(m.entries());
