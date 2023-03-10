import { finalObject, mergeMaps } from "@commonplace/utils";
import { DocumentModelLink } from "./document-model-link";
import { ZettelSchneider } from "./zettel-schneider";
import { testing } from '@commonplace/core';
import { SequencePrototype } from "./sequence-prototype";
import { EdlModel } from "./edl-model";
import { SequenceScanner } from './sequence-scanner';
import { defaultsPointer } from "../defaults";
import { MarkupCalculation } from "../Attributes/markup-calculation";

export function DocumentModelBuilder(edlPointer, repo) {
  let recursiveBuilder = RecursiveDocumentModelBuilder(edlPointer, repo, undefined, undefined);
  return finalObject({}, {
    build: () => {
      // Doc Models are built using two passes. The first assembles a hierarchy of models with
      // zettel and links. The second decorates all the objects in the hierarchy top-down with
      // markup information.
      let rootModel = recursiveBuilder.buildHierarchy();
      recursiveBuilder.addMarkup();
      return rootModel;
    }});
}

function RecursiveDocumentModelBuilder(edlPointer, repo, parent, indexInParent) {
  let obj = {};
  let childBuilders = [];
  let model, allLinks;

  function buildHierarchy() {
    let zettel = [];

    let edlPart = repo.getPartLocally(edlPointer);

    let key = parent ? parent.key + ":" + indexInParent.toString() : "1";

    if (edlPart === undefined) {
      return EdlModel(edlPointer, "missing EDL", [], [], undefined, [], {}, key);
    }

    let edl = edlPart.content;

    let defaultsEdl = repo.getPartLocally(defaultsPointer)?.content;
    let defaults = defaultsEdl ? Object.fromEntries(createLinkPairs(defaultsEdl, repo, undefined, true)) : {};

    let linkPairs = createLinkPairs(edl, repo, parent);
    let linksObject = Object.fromEntries(linkPairs);
    let links = Object.values(linksObject);
    allLinks = links.concat(Object.values(defaults));
    allLinks.forEach((link, i) => link.key = key + ":" + i);

    let pointersToEdl = [];
    links.forEach(l => l.forEachPointer((pointer, end, link) => {
      if (pointer.endowsTo(edlPointer)) { pointersToEdl.push({ pointer, end, link }) }
    }));

    model = EdlModel(edlPointer, edl.type, zettel, linksObject, parent, pointersToEdl, defaults, key);

    connectLinks(allLinks);
    gatherRules(model, allLinks);
    applyMetarules(model, allLinks);


    edl.clips.forEach((c, i) => {
      if (c.pointerType === "edl")
      {
        let childBuilder = RecursiveDocumentModelBuilder(c, repo, model, i);
        childBuilders.push(childBuilder);
        zettel.push(childBuilder.buildHierarchy());
      } else {
        let z = ZettelSchneider(c, links, key, i + allLinks.length).zettel();
        zettel.push(...z);
      }
    });

    let sequences = SequenceScanner(zettel, allLinks).sequences();
    model.setContainedSequences(sequences);

    return finalObject(model, {});
  }

  function addMarkup() {
    let objectsRequiringMarkup = allLinks.concat(model.zettel.filter(z => z.isZettel));
    let calc = MarkupCalculation(model, model.markupRules, objectsRequiringMarkup);
    let markupMap = calc.initialize();

    objectsRequiringMarkup.forEach(object => {
      let allMarkup = markupMap.get(object.key);
      mergeMaps(object.markup, allMarkup.markup());
      mergeMaps(object.contentMarkup, allMarkup.contentMarkup());
    });

    childBuilders.forEach(builder => builder.addMarkup());
  }

  return finalObject(obj, {
    buildHierarchy,
    addMarkup,
  });
}

function createLinkPairs(edl, repo, parent, isDefault) {
  let linkPairs = [];

  if (parent) {
    linkPairs = Object.entries(parent.links)
      .map(([key, link]) => [key, DocumentModelLink(Object.getPrototypeOf(link), link.index, link.pointer, link.depth+1, repo)]);
  }

  let childParts = edl.links.map((x, index) => [repo.getPartLocally(x), index]);
  let childPairs = childParts
  .filter(x => x[0])
  .map(([part, index]) => [part.pointer.hashableName, DocumentModelLink(part.content, index, part.pointer, 0, repo, isDefault)]);

  linkPairs = linkPairs.concat(childPairs);

  return linkPairs;
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
