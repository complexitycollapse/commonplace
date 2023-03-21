import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";
import { decorateObject, addMethods } from "@commonplace/utils";

export function DocumentModelLink(link, index, linkPointer, depth, repo, isDefault) {
  function docModelEnd(end) {
    let dme = Object.create(end);
    dme.sequencePrototypes = [];
    return dme;
  }

  let newLink = Object.create(link, {ends: {value: link.ends.map(docModelEnd), enumerable: true}});

  addMethods(newLink, {
    sequencePrototypes: () => newLink.incomingPointers.map(p => p.end.sequencePrototypes).flat(),
    getEnd: (name, index = 0) => {
      if (index < 0) { throw `Invalid index passed to getEnd: ${index}`; }
      for(let i = 0; i < newLink.ends.length; ++i) {
        let cur = newLink.ends[i];
        if (cur.name === name) {
          if (index > 0) {
            --index;
          } else {
            return cur;
          }
        }
      }
    },
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
  
    let rule = decorateObject(Rule(newLink, targets, linkTypes, clipTypes, edlTypes, attributes), extraEnds);
    return rule;
  }

  newLink.isDefault = isDefault
  newLink.incomingPointers = [];
  newLink.sequences = [];
  newLink.index = index;
  newLink.pointer = linkPointer;
  newLink.depth = depth;
  newLink.key = undefined; // set later
  newLink.rules = [];
  newLink.markup = new Map();
  newLink.contentMarkup = new Map();
  if (link.type === "markup") { newLink.markupRule = buildRule(["attribute", "value", "inheritance"]); }
  if (link.type === "endows attributes") { newLink.metaEndowmentRule = buildRule(["attribute", "value", "inheritance"], ["end"]); }
  if (link.type === "defines sequence") { newLink.metaSequenceRule = buildRule([], ["end", "type"]); }
  return newLink;
}