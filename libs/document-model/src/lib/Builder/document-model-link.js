import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";
import { decorateObject, addMethods } from "@commonplace/utils";

export function DocumentModelLink(link, index, linkPointer, depth, repo) {
  let newLink = Object.create(link, {ends: {value: link.ends.map(e => Object.create(e)), enumerable: true}});

  addMethods(newLink, {
    sequencePrototypes: () => newLink.incomingPointers.map(p => p.end.sequencePrototypes).flat()
  })

  function getPointers(name) {
    let end = link.getEnd(name);
    return end ? end.pointers : [];
  }

  function getContent(pointers) {
    return pointers.map(p => repo.getPartLocally(p).content);
  }

  function buildRule(attributeEnds, extraContentEnds = []) { 
    function resolveAttribute(attribute) {
      return Object.fromEntries(
        Object.entries(attribute).map(([key, val]) => [key, getContent(val).join("")]));
    }
  
    let targets = getPointers("targets");
    let linkTypes = getContent(getPointers("link types"));
    let edlTypes = getContent(getPointers("edl types"));
    let clipTypes = getContent(getPointers("clip types"));
    let unresolvedAttributes = RecordLinkParser(link, attributeEnds);
    let extraEnds = Object.fromEntries(extraContentEnds.map(e => [e, getContent(getPointers(e)).join("")]));

    let attributes = unresolvedAttributes.map(resolveAttribute);
  
    let rule = decorateObject(Rule(newLink, targets, linkTypes, clipTypes, edlTypes, attributes, extraEnds), extraEnds);
    return rule;
  }

  newLink.incomingPointers = [];
  newLink.index = index;
  newLink.pointer = linkPointer;
  newLink.depth = depth;
  if (link.type === "markup") { newLink.markupRule = buildRule(["attribute", "value"]); }
  if (link.type === "endows attributes") { newLink.metaEndowmentRule = buildRule(["attribute", "value", "inheritance"], ["end"]); }
  if (link.type === "defines sequence") { newLink.metaSequenceRule = buildRule([], ["end", "type"]); }
  return newLink;
}
