import {
  definesSemanticClassType, definesSequenceType, markupType
} from "../well-known-objects";
import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";
import { decorateObject, addMethods } from "@commonplace/utils";
import { SequencePrototype } from "./sequence-prototype";
import resolveTypeAndMetalinks from "./resolve-type";
import getClasses from "../Attributes/get-classes";
import SemanticClass from "./semantic-class";

export function DocumentModelLink(link, index, linkPointer, depth, cache, isDefault) {
  function docModelEnd(end) {
    let dme = Object.create(end);
    dme.sequencePrototypes = [];
    dme.semanticClasses = [];
    return dme;
  }

  let newLink = Object.create(link, {ends: {value: link.ends.map(docModelEnd), enumerable: true}});

  // Determines relative priority with another link, from most significant factor to least:
  // 1. Non-defaults higher than defaults
  // 3. Inner links higher than outer links
  // 4. Links later in the EDL higher than those earlier
  function compareLinkPriority(b) {
    if (newLink.isDefault !== b.isDefault) {
      return newLink.isDefault ? 1 : -1;
    } else if (newLink.depth != b.depth) {
      return newLink.depth - b.depth;
    }
    else { return b.index - newLink.index; }
  }

  addMethods(newLink, {
    sequencePrototypes: () => newLink.incomingPointers.map(p => p.end.sequencePrototypes).flat(),
    compareLinkPriority
  })

  function getPointers(name) {
    let end = link.getEnd(name);
    return end ? end.pointers : [];
  }

  function getContent(pointers) {
    return pointers.map(p => cache.getPart(p).content);
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

  function buildRule(attributeEnds, hasEnd) {
    function resolveAttribute(attribute) {
      return Object.fromEntries(
        Object.entries(attribute).map(([key, val]) => [key, concatenateContent(val)]));
    }

    let targets = getPointers("targets");
    let classes = getPointers("classes");
    let linkTypes = getPointers("link types");
    let edlTypes = getPointers("edl types");
    let clipTypes = getContent(getPointers("clip types"));
    let unresolvedAttributes = RecordLinkParser(link, attributeEnds);
    let extraEnds = [];
    if (hasEnd) { extraEnds.push(["end", getContent(getPointers("end")).join("")]); }

    let attributes = unresolvedAttributes.map(resolveAttribute);

    let rule = decorateObject(
      Rule(newLink, targets, classes, linkTypes, clipTypes, edlTypes, attributes),
      Object.fromEntries(extraEnds));
    return rule;
  }

  function processMetalinks() {
    metalinkPairs.forEach(([metalinkPointer, metalink]) => {
      newLink.metalinks.push(metalink);

      if (definesSequenceType.denotesSame(metalink.type)) {
        let endEnd = metalink.getEnd("end");
        let end = concatenateContent(endEnd?.pointers);
        let type = calculateSequenceType(metalink, newLink.resolvedType);
        newLink.getEnds(end.length === 0 ? undefined : end)
          .forEach(newLinkEnd => newLinkEnd.sequencePrototypes.push(
            SequencePrototype(type, newLinkEnd, newLink, metalinkPointer)));
      }

      if (definesSemanticClassType.denotesSame(metalink.type)) {
        let endEnd = metalink.getEnd("end");
        let end = concatenateContent(endEnd?.pointers ?? []);
        newLink.getEnds(end.length === 0 ? undefined : end)
          .forEach(newLinkEnd =>
            newLinkEnd.semanticClasses.push(SemanticClass(newLink.type, newLink.resolvedType)));
      }
    });
  }

  newLink.isDefault = isDefault
  newLink.incomingPointers = [];
  newLink.sequences = [];
  newLink.index = index;
  newLink.pointer = linkPointer;
  newLink.depth = depth;
  newLink.key = undefined; // set later
  newLink.getClasses = getClasses;
  newLink.markup = new Map();
  newLink.contentMarkup = new Map();
  newLink.metalinks = [];

  let [resolvedType, metalinkPairs] = resolveTypeAndMetalinks(link.type, cache);
  newLink.resolvedType = resolvedType;

  if (markupType.denotesSame(link.type)) { newLink.markupRule = buildRule(["attribute", "value", "inheritance"]); }

  processMetalinks();

  return newLink;
}
