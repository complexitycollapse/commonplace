import { finalObject, mergeMaps } from "@commonplace/utils";
import { DocumentModelLink } from "./document-model-link.js";
import { ZettelSchneider } from "./zettel-schneider.js";
import { defaultsPointer } from '../well-known-objects.js';
import { EdlModel, MissingEdlReplacementModel } from "./edl-model.js";
import { SequenceScanner } from './sequence-scanner.js';
import { MarkupMapBuilder } from "../Attributes/markup-map-builder.js";
import resolveTypeAndMetalinks from "./resolve-type.js";
import { createTestCache } from "../Testing/docuverse-builder.js";

export function DocumentModelBuilder(edlPointer, cache) {
  let recursiveBuilder = RecursiveDocumentModelBuilder(edlPointer, cache, undefined, undefined);
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

function RecursiveDocumentModelBuilder(edlPointer, cache, parent, indexInParent) {
  let obj = {};
  let childBuilders = [];
  let zettel = [];
  let edl, model, allLinks, links, linksMap, key;

  function createDefaults() {
    let defaultsEdl = cache.getPart(defaultsPointer)?.content;
    let defaults = new Map(defaultsEdl ? createLinkPairs(defaultsEdl, undefined, cache, undefined, true) : []);
    return defaults;
  }

  function createLinks(edl, parent, defaults) {
    let linkPairs = createLinkPairs(edl, model, cache, parent, false);
    linksMap = new Map(linkPairs);
    links = [...linksMap.values()];
    allLinks = links.concat([...defaults.values()]);
    allLinks.forEach((link, i) => link.key = key + ":L" + i);
  }

  function addZettelAndChildBuildersForClip(clip, index) {
    if (clip.pointerType === "edl")
    {
      let childBuilder = RecursiveDocumentModelBuilder(clip, cache, model, index);
      childBuilders.push(childBuilder);
      zettel.push(childBuilder.buildHierarchy());
    } else {
      let z = ZettelSchneider(clip, model, links, key, index + allLinks.length).zettel();
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
    sequences.forEach((sequence, i) => sequence.key = sequence.definingLink.key + "-S" + i);
  }

  function createModel(incomingPointers, defaults) {
    let [resolvedType, metalinkPairs] = resolveTypeAndMetalinks(edl.type, cache);
    let metalinks = metalinkPairs.map(x => x[1]);

    let model = EdlModel(
      edlPointer,
      edl.type,
      resolvedType,
      metalinks,
      zettel,
      linksMap,
      parent,
      incomingPointers,
      defaults,
      key);
    return model;
  }

  function buildHierarchy() {
    // Calculate the model's key (i.e. the unique identifier that will be used to refer to the model)
    key = parent ? parent.key + ":E" + indexInParent.toString() : "E1";

    // Fetch the EDL from the cache
    let edlPart = cache.getPart(edlPointer);
    if (edlPart === undefined) {
      return MissingEdlReplacementModel(edlPointer, key);
    }
    edl = edlPart.content;

    // Create the models for the links and defaults
    let defaults = createDefaults();
    createLinks(edl, parent, defaults);

    // Get all self-referring link pointers in this EDL
    let pointersToEdl = getPointersToEdl();

    // Create the EDL model
    model = createModel(pointersToEdl, defaults);

    // Process all the links and their consequences
    connectLinks(allLinks);
    gatherRules(model, allLinks);

    // Add Zettel to the model, and gather all the builders for the EDL children, ready for the next pass.
    // TODO: this doesn't seem to be using the second parameter to the fn. What's going on?
    edl.clips.forEach(addZettelAndChildBuildersForClip);

    // Add sequences to the model
    let sequences = SequenceScanner(zettel, allLinks).sequences();
    model.setContainedSequences(sequences);
    populateSequenceKeys(sequences);

    // Apply content to clips
    populateSpanContent(zettel, cache);

    return finalObject(model);
  }

  function addMarkup(parentMarkup) {
    if (!edl) { return; }
    parentMarkup = parentMarkup ?? new Map();

    let objectsRequiringMarkup = [model].concat(model.zettel.filter(z => z.isZettel)).concat(allLinks);
    let mmBuilder = MarkupMapBuilder(model, model.markupRules, objectsRequiringMarkup, parentMarkup);
    let markupMap = mmBuilder.getMarkupMap();

    objectsRequiringMarkup.forEach(object => {
      let allMarkup = markupMap.get(object.key);

      // Copy all the entries from the MarkupMap to the object's markup properties
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

function createLinkPairs(edl, parentModel, cache, parent, isDefault) {
  let linkPairs = [];

  if (parent) {
    linkPairs = Array.from(parent.links.entries(), 
      ([key, link]) => [key, DocumentModelLink(Object.getPrototypeOf(link), parentModel, link.index, link.pointer, link.depth+1, cache)]);
  }

  let childParts = edl.links.map((x, index) => [cache.getPart(x), index]);
  let childPairs = childParts
  .filter(x => x[0])
  .map(([part, index]) => [part.pointer.hashableName, DocumentModelLink(part.content, parentModel, index, part.pointer, 0, cache, isDefault)]);

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
  });
}

function populateSpanContent(zettel, cache) {
  zettel.forEach(z => {
    if (z.isEdl) { populateSpanContent(z.zettel, cache); }
    else {
      let contentPart = cache.getPart(z.pointer);
      if (contentPart) { z.setOriginContentPart(contentPart); }
     }
  });
}

export let docModelBuilderTesting = {
  addIncomingPointers,
  makeMockedBuilderFromParts: function (edlPointer, cachedParts) {
    let cache = createTestCache(cachedParts, true);
    return DocumentModelBuilder(edlPointer, cache);
  },
};
