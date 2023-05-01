import { definesSequenceType, endowsAttributesType, markupType } from "@commonplace/core";
import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";
import { decorateObject, addMethods } from "@commonplace/utils";
import { SequencePrototype } from "./sequence-prototype";

export function DocumentModelLink(link, index, linkPointer, depth, cache, isDefault) {
  function docModelEnd(end) {
    let dme = Object.create(end);
    dme.sequencePrototypes = [];
    return dme;
  }

  let newLink = Object.create(link, {ends: {value: link.ends.map(docModelEnd), enumerable: true}});

  addMethods(newLink, {
    sequencePrototypes: () => newLink.incomingPointers.map(p => p.end.sequencePrototypes).flat(),
    forEachPointer: fn => {
      newLink.ends.forEach(e => {
        e.pointers.forEach(p => {
          fn(p, e, newLink);
        });
      });
    }
  })

  function getPointers(name) {
    let end = link.getEnd(name);
    return end ? end.pointers : [];
  }

  function getContent(pointers) {
    return pointers.map(p => cache.getPartLocally(p).content);
  }

  function concatenateContent(pointers) {
    return getContent(pointers).join("");
  }

  function calculateSequenceType(metalink, linkType) {
    let typeEnd = metalink.getEnd("type");
    if (typeEnd === undefined) { return linkType; }
    else if (typeEnd.pointers.length === 1 && typeEnd.pointers[0].pointerType === "link") {
      return typeEnd.pointers[0];
    } else {
      let content = concatenateContent(typeEnd.pointers);
      return content === "" ? undefined : content;
    }
  }

  function resolveType() {
    if (link.type === undefined) {
      return undefined;
    } else if (link.type.pointerType === "link") {
      return cache.getPartLocally(link.type).content;
    } else {
      return link.type.inlineText;
    }
  }

  function buildRule(attributeEnds, hasEnd) {
    function resolveAttribute(attribute) {
      return Object.fromEntries(
        Object.entries(attribute).map(([key, val]) => [key, concatenateContent(val)]));
    }

    let targets = getPointers("targets");
    let linkTypes = getContent(getPointers("link types"));
    let edlTypes = getContent(getPointers("edl types"));
    let clipTypes = getContent(getPointers("clip types"));
    let unresolvedAttributes = RecordLinkParser(link, attributeEnds);
    let extraEnds = [];
    if (hasEnd) { extraEnds.push(["end", getContent(getPointers("end")).join("")]); }

    let attributes = unresolvedAttributes.map(resolveAttribute);

    let rule = decorateObject(
      Rule(newLink, targets, linkTypes, clipTypes, edlTypes, attributes),
      Object.fromEntries(extraEnds));
    return rule;
  }

  newLink.isDefault = isDefault
  newLink.incomingPointers = [];
  newLink.sequences = [];
  newLink.index = index;
  newLink.pointer = linkPointer;
  newLink.depth = depth;
  newLink.key = undefined; // set later
  newLink.markup = new Map();
  newLink.contentMarkup = new Map();
  newLink.metalinks = [];
  newLink.resolvedType = resolveType()

  if (markupType.denotesSame(link.type)) { newLink.markupRule = buildRule(["attribute", "value", "inheritance"]); }
  if (endowsAttributesType.denotesSame(link.type)) { newLink.metaEndowmentRule = buildRule(["attribute", "value", "inheritance"], true); }

  if (newLink.resolvedType?.isLink) {
    newLink.resolvedType.forEachPointer(metalinkPointer => {
      if (metalinkPointer.pointerType === "link") {
        let metalink = cache.getPartLocally(metalinkPointer).content;
        newLink.metalinks.push(metalink);
        if (definesSequenceType.denotesSame(metalink.type)) {
          let endEnd = metalink.getEnd("end");
          let end = concatenateContent(endEnd?.pointers);
          let type = calculateSequenceType(metalink, newLink.resolvedType);
          newLink.getEnds(end.length === 0 ? undefined : end)
            .forEach(newLinkEnd => newLinkEnd.sequencePrototypes.push(
              SequencePrototype(type, newLinkEnd, newLink, metalinkPointer)));
        }
      }
    });
  }

  return newLink;
}
