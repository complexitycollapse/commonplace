import { addProperties, addMethods, finalObject } from '@commonplace/utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { EdlPointer, LinkPointer } from '@commonplace/core';
import { Edl } from '@commonplace/core';
import { AddPointerTargetFeatures } from './pointer-target';

export function EdlZettel(edlPointer, parent, defaults = [], key, edl, links, parts) {
  let obj = {
    edl: undefined,
    renderLinks: undefined,
    state: undefined
  };

  let renderPointerCollection = AddPointerTargetFeatures(obj, edlPointer, () => obj.edl, obj, parent)

  addProperties(obj, {
    key,
    clip: edlPointer,
    hashableName: edlPointer.hashableName,
    parent,
    children: [],
    defaults
  });

  addMethods(obj, {
    outstandingRequests: () => obj.state.outstandingRequests(),
    getRenderLinkForPointer: linkPointer => obj.renderLinks.find(r => r.pointer.hashableName === linkPointer.hashableName),
    depth: () => parent === undefined ? 0 : 1 + parent.depth()
  });

  TransitionToResolveEdlState(renderPointerCollection, obj, parts);
  if (edl) {
    TransitionToResolveLinksState(renderPointerCollection, obj, edl, parts);
    if (links && obj.state.resolveLink) {
      links.forEach((l, i) => obj.state.resolveLink(l, i));
    }

    if (parts && obj.state.resolveLinkFromPartWithoutIndex) {
      parts.forEach(obj.state.resolveLinkFromPartWithoutIndex);
    }

    if (parts && obj.state.resolveContent) {
      let state = obj.state;
      parts.forEach(p => state.resolveContent(p));
      // The state may transition from link content to EDL content,
      // so need to resolve both kinds.
      if (state != obj.state) {
        parts.forEach(p => obj.state.resolveContent(p));
      }
    }
  }

  return obj;
}

function TransitionToResolveEdlState(renderPointerCollection, harness, parts) {
  let obj = { harness };

  function resolveEdl(part) {
    TransitionToResolveLinksState(renderPointerCollection, harness, part.content, parts);
  }

  harness.state = finalObject(obj, {
    outstandingRequests: () => [[harness.clip, resolveEdl]]
  });
}

function TransitionToResolveLinksState(renderPointerCollection, harness, edl, parts) {
  let unresolvedLinks = [...edl.links];
  let links = new Array(unresolvedLinks.length);
  
  let obj = {};

  function resolveLinkFromPart(part, index) {
    let link = part.content;
    resolveLink(link, index);
  }

  function resolveLinkFromPartWithoutIndex(part) {
    let index = edl.links.findIndex((p, i) => p.denotesSame(part.pointer) && unresolvedLinks[i] !== undefined);
    if (index >= 0) { resolveLinkFromPart(part, index); }
  }

  function resolveLink(link, index) {
    unresolvedLinks[index] = undefined;
    links[index] = link;

    if (unresolvedLinks.some(x => x)) {
      return;
    }

    TransitionToResolveLinkContentState(renderPointerCollection, harness, links, parts);
  }

  harness.edl = edl;

  if (edl.links.length > 0) {
    harness.state = obj;
  } else {
    TransitionToResolveLinkContentState(renderPointerCollection, harness, [], parts);
  }

  addMethods(obj, {
    outstandingRequests: () => unresolvedLinks.filter(x => x).map((x, i) => [x, p => resolveLinkFromPart(p, i)]),
    resolveLink,
    resolveLinkFromPartWithoutIndex
  });
}

function TransitionToResolveLinkContentState(renderPointerCollection, harness, links, parts) {
  let obj = {
  };

  harness.state = obj;

  function applyLinksToSelf() {
    renderPointerCollection.addDefaults(harness.defaults);
    renderPointerCollection.allAllEdlRenderLinks(harness.renderLinks);
  }

  function createChildZettel() {
    harness.edl.clips.forEach((clip, index) => {
      let newKey = harness.key + "." + index.toString();
      
      if (clip.pointerType === "edl") {
        let childEdl = parts?.find(p => clip.denotesSame(p.pointer)).content;
        harness.children.push(EdlZettel(clip, harness, harness.defaults, newKey, childEdl, undefined, parts));
      } else {
        let zettel = ZettelSchneider(clip, harness.renderLinks, newKey, harness).zettel();
        zettel.forEach(z => harness.children.push(z));
      }
    });
  }

  function outstandingLinkContent() {
    let rps = harness.renderPointers();
    return rps.map(p => p.renderLink.outstandingRequests()).flat();
  }

  function resolveContent(part) {
    harness.renderPointers().forEach(p => p.renderEnd.resolveContent(part));
  }

  function tryStateTransition() {
    if (outstandingLinkContent().length == 0) {
      TransitionToResolveEdlContentState(harness);
    }
  }

  function wrapContentRequest([clip, callback]) {
    return [clip, p => {
      callback(p);
      tryStateTransition();
    }];
  }

  addMethods(obj, {
    outstandingRequests: () => outstandingLinkContent().map(wrapContentRequest),
    resolveContent
  });

  harness.renderLinks = RenderLinkFactory(harness, links).renderLinks();

  applyLinksToSelf();
  createChildZettel();
  tryStateTransition();
}

function TransitionToResolveEdlContentState(harness) {
  let obj = {};

  function resolveContent(part) {
    harness.children.forEach(c => c.tryAddPart && c.tryAddPart(part));
  }

  addMethods(obj, {
    outstandingRequests: () => harness.children.map(z => z.outstandingRequests()).flat(),
    resolveContent
  });

  harness.state = obj;
}

export function makeTestEdlZettel(edl, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, undefined, key, edl);
  return edlz;
}

export function makeTestEdlZettelWithLinks(edl, links, {edlPointer, parent, key, parts} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, undefined, key, edl, links, parts);
  return edlz;
}

export function makeTestEdlAndEdlZettelFromLinks(links, linkNames, parent, edlPointer, parts) {
  linkNames = linkNames ?? links.map((x, i) => LinkPointer(i.toString()));
  let edl = Edl(undefined, [], linkNames);
  let edlZettel = makeTestEdlZettelWithLinks(edl, links, { parent, edlPointer, parts });
  return edlZettel;
}
