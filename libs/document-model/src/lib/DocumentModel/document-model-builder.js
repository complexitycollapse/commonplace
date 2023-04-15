import { finalObject, mergeMaps } from "@commonplace/utils";
import { DocumentModelLink } from "./document-model-link";
import { ZettelSchneider } from "./zettel-schneider";
import { testing, defaultsPointer } from '@commonplace/core';
import { SequencePrototype } from "./sequence-prototype";
import { EdlModel } from "./edl-model";
import { SequenceScanner } from './sequence-scanner';
import { MarkupCalculation } from "../Attributes/markup-calculation";

export function DocumentModelBuilder(edlPointer, repo) {
  let recursiveBuilder = RecursiveDocumentModelBuilder(edlPointer, repo, undefined, undefined);
  return finalObject({}, {
    build: () => {
      // DocModels are built using two passes. The first assembles a hierarchy of models with
      // zettel and links. The second decorates all the objects in the hierarchy top-down with
      // markup information. Why? Because an object in the hierarchy can inherit markup from
      // its container, and containers can be sequences, and sequences can't be calculated until
      // you have a hierarchy.
      let rootModel = recursiveBuilder.buildHierarchy();
      recursiveBuilder.addMarkup(undefined);
      return rootModel;
    }});
}

function RecursiveDocumentModelBuilder(edlPointer, repo, parent, indexInParent) {
  let obj = {};
  let childBuilders = [];
  let zettel = [];
  let edl, model, allLinks, links, linksObject, key;

  function createDefaults() {
    let defaultsEdl = repo.getPartLocally(defaultsPointer)?.content;
    let defaults = defaultsEdl ? Object.fromEntries(createLinkPairs(defaultsEdl, repo, undefined, true)) : {};
    return defaults;
  }

  function createLinks(edl, parent, defaults) {
    let linkPairs = createLinkPairs(edl, repo, parent, false);
    linksObject = Object.fromEntries(linkPairs);
    links = Object.values(linksObject);
    allLinks = links.concat(Object.values(defaults));
    allLinks.forEach((link, i) => link.key = key + ":" + i);
  }

  function addZettelAndChildBuildersForClip(clip, index) {
    if (clip.pointerType === "edl")
    {
      let childBuilder = RecursiveDocumentModelBuilder(clip, repo, model, index);
      childBuilders.push(childBuilder);
      zettel.push(childBuilder.buildHierarchy());
    } else {
      let z = ZettelSchneider(clip, links, key, index + allLinks.length).zettel();
      zettel.push(...z);
    }
  }

  function getPointersToEdl() {
    let pointersToEdl = [];
    links.forEach(l => l.forEachPointer((pointer, end, link) => {
      if (pointer.endowsTo(edlPointer)) { pointersToEdl.push({ pointer, end, link }) }
    }));
    return pointersToEdl;
  }

  function populateSequenceKeys(sequences) {
    sequences.forEach((sequence, i) => sequence.key = sequence.definingLink.key + "-" + i);
  }

  function buildHierarchy() {
    // Calculate the model's key (i.e. the unique identifier that will be used to refer to the model)
    key = parent ? parent.key + ":" + indexInParent.toString() : "1";

    // Fetch the EDL from the repo
    let edlPart = repo.getPartLocally(edlPointer);
    if (edlPart === undefined) {
      return EdlModel(edlPointer, "missing EDL", [], [], undefined, [], {}, key);
    }
    edl = edlPart.content;

    // Create the models for the links and defaults
    let defaults = createDefaults();
    createLinks(edl, parent, defaults);

    // Get all self-referring link pointers in this EDL
    let pointersToEdl = getPointersToEdl();

    // Create the EDL model
    model = EdlModel(edlPointer, edl.type, zettel, linksObject, parent, pointersToEdl, defaults, key);

    // Process all the links and their consequences
    connectLinks(allLinks);
    gatherRules(model, allLinks);
    applyMetarules(model, allLinks);

    // Add Zettel to the model, and gather all the builders for the EDL children, ready for the next pass.
    edl.clips.forEach(addZettelAndChildBuildersForClip);

    // Add sequences to the model
    let sequences = SequenceScanner(zettel, allLinks).sequences();
    model.setContainedSequences(sequences);
    populateSequenceKeys(sequences);

    // Handle content
    populateSpanContent(zettel, repo);

    return finalObject(model, {});
  }

  function addMarkup(parentMarkup) {
    if (!edl) { return; }
    parentMarkup = parentMarkup ?? new Map();

    let objectsRequiringMarkup = [model].concat(model.zettel.filter(z => z.isZettel)).concat(allLinks);
    let calc = MarkupCalculation(model, model.markupRules, objectsRequiringMarkup, parentMarkup);
    let markupMap = calc.initialize();

    objectsRequiringMarkup.forEach(object => {
      let allMarkup = markupMap.get(object.key);
      mergeMaps(object.markup, allMarkup.markup());
      mergeMaps(object.contentMarkup, allMarkup.contentMarkup());
    });

    parentMarkup.set(model.key, markupMap.get(model.key));
    childBuilders.forEach(builder => builder.addMarkup(parentMarkup));
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

function populateSpanContent(zettel, repo) {
  zettel.forEach(z => {
    if (z.isEdl) { populateSpanContent(z.zettel, repo); }
    else {
      let contentPart = repo.getPartLocally(z.pointer);
      if (contentPart) { z.setOriginContentPart(contentPart); }
     }
  });
}

export let docModelBuilderTesting = {
  addIncomingPointers,
  makeMockedBuilderFromParts: function (edlPointer, cachedParts) {
    let repo = testing.MockPartRepository(cachedParts);
    return DocumentModelBuilder(edlPointer, repo);
  }
};
