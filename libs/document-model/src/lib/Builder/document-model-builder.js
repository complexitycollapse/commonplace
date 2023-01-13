import { finalObject } from "@commonplace/utils";
import { RecordLinkParser } from "../record-link-parser";
import { Rule } from "./rule";
import { ZettelSchneider2 } from "./zettel-schneider-2";

export function DocumentModelBuilder(edlPointer, repo) {
  let obj = {};

  function build() {
    return buildRecursively(edlPointer, undefined);
  }

  function buildRecursively(edlPointer, parent) {
    let zettel = [];

    let edlPart = repo.getPartLocally(edlPointer);

    if (edlPart === undefined) {
      return EdlModel("missing EDL", [], [], undefined);
    }

    let edl = edlPart.content;
    let linksList = [];
    if (parent) {
      linksList = Object.entries(parent.links)
        .map(([key, link]) => [key, LinkWithIncommingPointers(Object.getPrototypeOf(link), link.index, link.pointer, link.depth+1)]);
    }
    linksList = linksList.concat(edl.links.map((x, index) => [repo.getPartLocally(x), index])
      .filter(x => x[0])
      .map(([part, index]) => [part.pointer.hashableName, LinkWithIncommingPointers(part.content, index, part.pointer, 0)]));
    let links = Object.fromEntries(linksList);

    let model = EdlModel(edl.type, zettel, links, parent);

    connectLinks(links);
    parseRules(model, linksList);

    edl.clips.forEach(c => {
      if (c.pointerType === "edl")
      {
        zettel.push(buildRecursively(c, model));
      } else {
        let z = ZettelSchneider2(c, linksList.map(x => x[1])).zettel();
        zettel.push(...z);
      }
    });

    return finalObject(model, {});
  }

  return finalObject(obj, { build });
}

function LinkWithIncommingPointers(link, index, linkPointer, depth) {
  let newLink = Object.create(link);
  newLink.incomingPointers = [];
  newLink.index = index;
  newLink.pointer = linkPointer;
  newLink.depth = depth;
  return newLink;
}

function EdlModel(type, zettel, links, parent) {
  let model = {
    type, zettel, links, markupRules: [], semanticRules: [], sequenceRules: []
  };
  Object.defineProperty(model, "parent", { value: parent, enumerable: false});
  return model;
}

function connectLinks(linksObject) {
  let links = Object.values(linksObject);
  links.forEach(l1 => addIncomingPointers(l1, links));
}

function addIncomingPointers(target, links) {
  links.forEach(l2 => l2.forEachPointer((p, e) => tryAdd(p, e, l2, target)));
}

function tryAdd(pointer, end, incomingLink, targetLink) {
  if (!pointer.endowsTo(targetLink.pointer)) {
    return;
  }

  targetLink.incomingPointers.push({ pointer, end, link: incomingLink });
}

function parseRules(model, linksList) {
  linksList.forEach(link => {
    switch (link.type) {
      case "markup":
        model.markupRules.push(buildMarkupRule(link));
        break;
    }
  });
}

function buildMarkupRule(link) {
  function getPointers(name) {
    let end = link.getEnd(name);
    return end ? end.pointers : [];
  }

  let targets = getPointers("targets");
  let linkTypes = getPointers("link types");
  let edlTypes = getPointers("edl types");
  let clipTypes = getPointers("clip types");
  let attributes = RecordLinkParser(link, ["attribute", "value"]);

  let rule = Rule(link, targets, linkTypes, clipTypes, edlTypes, attributes);
  return rule;
}

export let docModelBuilderTesting = {
  LinkWithIncommingPointers,
  addIncomingPointers
};