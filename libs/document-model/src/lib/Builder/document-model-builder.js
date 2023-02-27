import { finalObject } from "@commonplace/utils";
import { DocumentModelLink } from "./document-model-link";
import { ZettelSchneider2 } from "./zettel-schneider-2";
import { testing } from '@commonplace/core';
import { SequencePrototype } from "./sequence-prototype";
import { EdlModel } from "./edl-model";

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
    let linkPairs = [];
    if (parent) {
      linkPairs = Object.entries(parent.links)
        .map(([key, link]) => [key, DocumentModelLink(Object.getPrototypeOf(link), link.index, link.pointer, link.depth+1, repo)]);
    }
    linkPairs = linkPairs.concat(edl.links.map((x, index) => [repo.getPartLocally(x), index])
      .filter(x => x[0])
      .map(([part, index]) => [part.pointer.hashableName, DocumentModelLink(part.content, index, part.pointer, 0, repo)]));
    let linksObject = Object.fromEntries(linkPairs);
    let links = Object.values(linksObject);

    let pointersToEdl = [];
    links.forEach(l => l.forEachPointer((pointer, end, link) => {
      if (pointer.endowsTo(edlPointer)) { pointersToEdl.push({ pointer, end, link }) }
    }));
    let model = EdlModel(edlPointer, edl.type, zettel, linksObject, parent, pointersToEdl);

    connectLinks(links);
    gatherRules(model, links);
    applyMetarules(model, links);

    edl.clips.forEach(c => {
      if (c.pointerType === "edl")
      {
        zettel.push(buildRecursively(c, model));
      } else {
        let z = ZettelSchneider2(c, links).zettel();
        zettel.push(...z);
      }
    });

    return finalObject(model, {});
  }

  return finalObject(obj, { build });
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
        end.sequencePrototypes.push(SequencePrototype(rule.type, end, link, rule.originLink.pointer));
      }
    });
  });
}

export let docModelBuilderTesting = {
  addIncomingPointers,
  makeMockedBuilder: function (edlPointer, cachedParts) {
    let repo = testing.MockPartRepository(cachedParts);
    return DocumentModelBuilder(edlPointer, repo);
  }
};