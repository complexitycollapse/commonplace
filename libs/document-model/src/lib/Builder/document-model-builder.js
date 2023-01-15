import { finalObject } from "@commonplace/utils";
import { DocumentModelLink } from "./document-model-link";
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
        .map(([key, link]) => [key, DocumentModelLink(Object.getPrototypeOf(link), link.index, link.pointer, link.depth+1, repo)]);
    }
    linksList = linksList.concat(edl.links.map((x, index) => [repo.getPartLocally(x), index])
      .filter(x => x[0])
      .map(([part, index]) => [part.pointer.hashableName, DocumentModelLink(part.content, index, part.pointer, 0, repo)]));
    let links = Object.fromEntries(linksList);

    let model = EdlModel(edl.type, zettel, links, parent);

    connectLinks(links);
    gatherRules(model, links);

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
    type, zettel, links, markupRules: [], metaEndowmentRules: [], metaSequenceRules: []
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

function gatherRules(model, linksObj) {
  Object.values(linksObj).forEach(link => {
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

export let docModelBuilderTesting = {
  addIncomingPointers
};