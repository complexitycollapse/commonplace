import {
  definesSemanticClassType, definesSequenceType, markupType
} from "../well-known-objects.js";
import { RecordLinkParser } from "../record-link-parser.js";
import { Rule } from "./rule.js";
import { decorateObject, addMethods, memoize } from "@commonplace/utils";
import { SequencePrototype } from "./sequence-prototype.js";
import resolveTypeAndMetalinks from "./resolve-type.js";
import { getClasses, hasClass, getLevels } from "../class-mixins.js";
import SemanticClass from "./semantic-class.js";

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
    compareLinkPriority,
    // Why would parentModel be null? If the link is a default then null is passed in.
    // TODO: This is an ugly hack. Better to have a model for the defaults Edl.
    getContainers: () => newLink.parentModel ? [newLink.parentModel].concat(newLink.sequences) : newLink.sequences
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

  function buildRule(hasEnd) {

    function resolveAttributes(record) {
      return Object.fromEntries(
        Object.entries(record).map(([key, val]) => [key, concatenateContent(val)]));
    }

    function resolveLevel(record) {
      const level = {
        level: record.level[0],
        depth: undefined
      };
      if (record?.depth) {
        const depthString = concatenateContent(record.depth);
        const depthInt = parseInt(depthString, 10);
        if (!isNaN(depthInt)) {
          level.depth = depthInt;
        }
      }

      return level;
    }

    let targets = getPointers("targets");
    let classes = getPointers("classes");
    let linkTypes = getPointers("link types");
    let edlTypes = getPointers("edl types");
    let clipTypes = getContent(getPointers("clip types"));
    let levels = RecordLinkParser(link, ["level", "depth"]).map(resolveLevel);
    let attributes = RecordLinkParser(link, ["attribute", "value", "inheritance"]).map(resolveAttributes);
    let extraEnds = [];
    if (hasEnd) { extraEnds.push(["end", getContent(getPointers("end")).join("")]); }

    let rule = decorateObject(
      Rule(newLink, targets, classes, linkTypes, clipTypes, edlTypes, levels, attributes),
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
  newLink.hasClass = hasClass;
  newLink.getLevels = memoize(() => getLevels.apply(newLink));
  newLink.markup = new Map();
  newLink.contentMarkup = new Map();
  newLink.metalinks = [];
  newLink.parentModel = undefined; // needs to be set after the EdlModel is created

  let [resolvedType, metalinkPairs] = resolveTypeAndMetalinks(link.type, cache);
  newLink.resolvedType = resolvedType;

  if (markupType.denotesSame(link.type)) { newLink.markupRule = buildRule(); }

  processMetalinks();

  return newLink;
}
