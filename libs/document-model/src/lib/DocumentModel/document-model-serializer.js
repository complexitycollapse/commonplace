import { finalObject } from "@commonplace/utils";

export function DocumentModelSerializer(docModel) {
  function serialize() {
    let serialized = serializeEdl(docModel);
    serialized.defaults = Object.values(docModel.defaultsLinks).map(serializeLink);
    return serialized;
  }

  function serializeEdl(model) {
    let links = Object.values(model.links).map(serializeLink);
    let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
    let sequences = model.sequences.map(s => linkName(s.definingLink));
    let zettel = model.zettel.map(serializeZettel);

    return {
      key: model.key,
      type: model.type,
      pointer: model.pointer.leafData(),
      links,
      zettel,
      incomingPointers,
      sequences,
      markup: markup(model.markup),
      contentMarkup: markup(model.contentMarkup),
      rules: {
        markup: links.map(markupRule).filter(x => x),
        metaEndowments: links.map(metaEndowmentRule).filter(x => x),
        metaSequences: links.map(metaSequenceRule).filter(x => x)
      }
    };
  }

  function markupRule(link) {
    if (link.markupRule) {
      return {
        link: linkName(link),
        attributes: link.markupRule.attributeDescriptors,
        targets: link.markupRule.targets.map(x => x.leafData()),
        clipTypes: link.markupRule.clipTypes,
        edlTypes: link.markupRule.edlTypes,
        linkTypes: link.markupRule.linkTypes
      };
    }
  }

  function metaEndowmentRule(link) {
    if (link.metaEndowmentRule) {
      return {
        link: linkName(link),
        end: link.metaEndowmentRule.end,
        attributes: link.metaEndowmentRule.attributeDescriptors,
        targets: link.metaEndowmentRule.targets.map(x => x.leafData()),
        clipTypes: link.metaEndowmentRule.clipTypes,
        edlTypes: link.metaEndowmentRule.edlTypes,
        linkTypes: link.metaEndowmentRule.linkTypes
      };
    }
  }

  function metaSequenceRule(link) {
    if (link.metaSequenceRule) {
      return {
        link: linkName(link),
        type: link.metaEndowmentRule.type,
        end: link.metaEndowmentRule.end,
        targets: link.metaSequenceRule.targets.map(x => x.leafData()),
        clipTypes: link.metaSequenceRule.clipTypes,
        edlTypes: link.metaSequenceRule.edlTypes,
        linkTypes: link.metaSequenceRule.linkTypes
      };
    }
  }

  function serializeZettel(model) {
    if (model.isEdl) { return serializeEdl(model); }
    else {
      let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
      let sequences = model.sequences.map(s => linkName(s.definingLink));

      return {
        key: model.key,
        pointer: model.pointer.leafData(),
        incomingPointers,
        sequences,
        markup: markup(model.markup),
        contentMarkup: markup(model.contentMarkup)
      }
    }
  }

  function serializeLink(model) {
    let incomingPointers = model.incomingPointers.map(serializeIncomingPointer);
    let sequences = model.sequences.map(s => linkName(s.definingLink));
    let ends = model.ends.map(serializeEnd);

    return {
      key: model.key,
      name: model.pointer.linkName,
      type: model.type,
      ends,
      incomingPointers,
      sequences,
      markup: markup(model.markup),
      contentMarkup: markup(model.contentMarkup)
    };
  }

  function serializeEnd(model) {
    return {
      name: model.name,
      pointers: model.pointers.map(p => p.leafData()),
      sequencePrototypes: model.sequencePrototypes.map(serializeSequencePrototype)
    };
  }

  function serializeSequencePrototype(prototype) {
    return {
      type: prototype.type,
      signature: {
        linkPointer: prototype.linkPointer.leafData(),
        metalinkPointer: prototype.metalinkPointer.leafData()
      }
    };
  }

  function serializeIncomingPointer(model) {
    return {
      end: model.end.name,
      link: linkName(model.link)
    };
  }

  const linkName = model => model.pointer.linkName;

  const markup = m => Object.fromEntries(m.entries());

  return finalObject({}, { serialize });
}
