import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";

export function DocumentModelLink(link, index, linkPointer, depth, repo) {
  function getPointers(name) {
    let end = link.getEnd(name);
    return end ? end.pointers : [];
  }

  function getContent(pointers) {
    return pointers.map(p => repo.getPartLocally(p).content);
  }

  function buildMarkupRule() { 
    function resolveAttribute(attribute) {
      return Object.fromEntries(
        Object.entries(attribute).map(([key, val]) => [key, getContent(val).join("")]));
    }
  
    let targets = getPointers("targets");
    let linkTypes = getContent(getPointers("link types"));
    let edlTypes = getContent(getPointers("edl types"));
    let clipTypes = getContent(getPointers("clip types"));
    let unresolvedAttributes = RecordLinkParser(link, ["attribute", "value"]);
  
    let attributes = unresolvedAttributes.map(resolveAttribute);
  
    let rule = Rule(link, targets, linkTypes, clipTypes, edlTypes, attributes);
    return rule;
  }

  let newLink = Object.create(link, {ends: {value: link.ends.map(e => Object.create(e)), enumerable: true}});
  newLink.incomingPointers = [];
  newLink.index = index;
  newLink.pointer = linkPointer;
  newLink.depth = depth;
  if (link.type === "markup") { newLink.markupRule = buildMarkupRule(); }
  return newLink;
}
