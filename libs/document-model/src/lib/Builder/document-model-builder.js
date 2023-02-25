import { finalObject } from "@commonplace/utils";
import { DocumentModelLink } from "./document-model-link";
import { ZettelSchneider2 } from "./zettel-schneider-2";
import { testing } from '@commonplace/core';
import { SequencePrototype } from "./sequence-prototype";

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
        .map(([key, link]) => [key, DocumentModelLink(Object.getPrototypeOf(link), link.index, link.pointer, link.depth+1, repo)]);
    }
    linksList = linksList.concat(edl.links.map((x, index) => [repo.getPartLocally(x), index])
      .filter(x => x[0])
      .map(([part, index]) => [part.pointer.hashableName, DocumentModelLink(part.content, index, part.pointer, 0, repo)]));
    let linksObject = Object.fromEntries(linksList);
    let links = Object.values(linksObject);

    let model = EdlModel(edl.type, zettel, linksObject, parent);

    connectLinks(links);
    gatherRules(model, links);
    applyMetarules(model, links);

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

function EdlModel(type, zettel, links, parent) {
  let model = {
    type, zettel, links, markupRules: [], metaEndowmentRules: [], metaSequenceRules: [], sequences: []
  };
  Object.defineProperty(model, "parent", { value: parent, enumerable: false});
  return model;
}

function connectLinks(links) {
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

function gatherRules(model, links) {
  links.forEach(link => {
    if (link.markupRule) {
      model.markupRules.push(link.markupRule);
    }
    if (link.metaEndowmentRule) {
      model.metaEndowmentRules.push(link.metaEndowmentRule);
    }
    if (link.metaSequenceRule) {
      model.metaSequenceRules.push(link.metaSequenceRule);
    }
  });
}

function applyMetarules(model, links) {
  links.forEach(link => {
    let matching = model.metaSequenceRules.filter(r => r.match(link));
    matching.forEach(rule => {
      let end = link.getEnd(rule.end);
      if (end) {
        ensureAndPush(end, "sequencePrototypes", SequencePrototype(rule, end, link));
      }
    });
  });
}

function ensureAndPush(object, property, item) {
  if (object[property] === undefined) { object[property] = [item]; }
  else { object[property].push(item); }
}

export let docModelBuilderTesting = {
  addIncomingPointers,
  makeMockedBuilder: function (edlPointer, cachedParts) {
    let repo = testing.MockPartRepository(cachedParts);
    return DocumentModelBuilder(edlPointer, repo);
  }
};