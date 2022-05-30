import { addProperties, addMethods, finalObject } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { RenderPointerCollection } from './render-pointer-collection';
import { EdlPointer, LinkPointer } from '../pointers';
import { Edl } from '../model';
import { Attributes } from './attributes';

export function EdlZettel(edlPointer, parent, defaults = [], key, edl, links, parts) {
  let obj = {
    edl: undefined,
    renderLinks: undefined,
    state: undefined,
    renderPointerCollection: undefined
  };

  addProperties(obj, {
    key,
    clip: edlPointer,
    hashableName: edlPointer.hashableName,
    parent,
    children: [],
    nameLinkPairs: [],
    defaults
  });

  addMethods(obj, {
    outstandingRequests: () => obj.state.outstandingRequests(),
    attributes() {
      let pointerStack, defaultsStack;
      if (obj.renderPointerCollection) {
        pointerStack = obj.renderPointerCollection.pointerStack();
        defaultsStack = obj.renderPointerCollection.defaultsStack();
      } else {
        pointerStack = [];
        defaultsStack = [];
      }

      return Attributes(obj, obj.parent?.attributes(), pointerStack, defaultsStack);
    },
    renderPointers: () => {
      return obj.renderPointerCollection ? obj.renderPointerCollection.renderPointers() : [];
    }
  });

  TransitionToResolveEdlState(obj, parts);
  if (edl) {
    TransitionToResolveLinksState(obj, edl, parts);
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

function TransitionToResolveEdlState(harness, parts) {
  let obj = { harness };

  function resolveEdl(part) {
    TransitionToResolveLinksState(harness, part.content, parts);
  }

  harness.state = finalObject(obj, {
    outstandingRequests: () => [[harness.clip, resolveEdl]]
  });
}

function TransitionToResolveLinksState(harness, edl, parts) {
  let unresolvedLinks = [...edl.links];
  let links = new Array(unresolvedLinks.length);
  
  let obj = {};

  function resolveLinkFromPart(part, index) {
    let link = part.content;
    resolveLink(link, index);
  }

  function resolveLinkFromPartWithoutIndex(part) {
    let index = edl.links.findIndex(p => p.denotesSame(part.pointer));
    if (index >= 0) { resolveLinkFromPart(part, index); }
  }

  function resolveLink(link, index) {
    unresolvedLinks[index] = undefined;
    links[index] = link;

    if (unresolvedLinks.some(x => x)) {
      return;
    }

    TransitionToResolveLinkContentState(harness, links, parts);
  }

  harness.edl = edl;

  if (edl.links.length > 0) {
    harness.state = obj;
  } else {
    TransitionToResolveLinkContentState(harness, [], parts);
  }

  addMethods(obj, {
    outstandingRequests: () => unresolvedLinks.filter(x => x).map((x, i) => [x, p => resolveLinkFromPart(p, i)]),
    resolveLink,
    resolveLinkFromPartWithoutIndex
  });
}

function TransitionToResolveLinkContentState(harness, links, parts) {
  let obj = {
  };

  harness.state = obj;
  harness.nameLinkPairs.push(...harness.edl.links.map((n, i) => [n, links[i]]));

  function applyLinksToSelf() {
    harness.renderPointerCollection = RenderPointerCollection(harness.clip, harness.edl, harness);
    harness.renderPointerCollection.addDefaults(harness.defaults);
    harness.renderPointerCollection.tryAddAll(harness.renderLinks);
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
    let rps = harness.renderPointerCollection.renderPointers();
    return rps.map(p => p.renderLink.outstandingRequests()).flat();
  }

  function resolveContent(part) {
    harness.renderPointerCollection.forEach(p => p.resolveContent(part));
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

  harness.renderLinks = RenderLinkFactory(harness).renderLinks();

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

export function makeTestEdlZettelWithLinks(edl, links, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, undefined, key, edl, links);
  return edlz;
}

export function makeTestEdlAndEdlZettelFromLinks(links, linkNames, parent, edlPointer) {
  linkNames = linkNames ?? links.map((x, i) => LinkPointer(i.toString()));
  let edl = Edl(undefined, [], linkNames);
  let edlZettel = makeTestEdlZettelWithLinks(edl, links, { parent, edlPointer });
  return edlZettel;
}
