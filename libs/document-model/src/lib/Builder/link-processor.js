import { finalObject } from "@commonplace/utils";
import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";

export function LinkProcessor(repo) {
  let obj = {};

  function getPointers(link, name) {
    let end = link.getEnd(name);
    return end ? end.pointers : [];
  }

  function getContent(pointers) {
    return pointers.map(p => repo.getPartLocally(p).content);
  }

  function buildMarkupRule(link) { 
    function resolveAttribute(attribute) {
      return Object.fromEntries(
        Object.entries(attribute).map(([key, val]) => [key, getContent(val).join("")]));
    }
  
    let targets = getPointers(link, "targets");
    let linkTypes = getContent(getPointers(link, "link types"));
    let edlTypes = getContent(getPointers(link, "edl types"));
    let clipTypes = getContent(getPointers(link, "clip types"));
    let unresolvedAttributes = RecordLinkParser(link, ["attribute", "value"]);
  
    let attributes = unresolvedAttributes.map(resolveAttribute);
  
    let rule = Rule(link, targets, linkTypes, clipTypes, edlTypes, attributes);
    return rule;
  }

  return finalObject(obj, {
    buildMarkupRule
  });
}
