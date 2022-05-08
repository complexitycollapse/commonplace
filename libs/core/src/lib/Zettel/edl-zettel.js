import { addProperties, addMethods, finalObject } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { RenderPointerCollection } from './render-pointer-collection';
import { EdlPointer, LinkPointer } from '../pointers';
import { Edl } from '../model';
import { EdlTypePointer } from '../Pointers/edl-type-pointer';

export function EdlZettel(edlPointer, parent, key, edl, links, parts) {
  let obj = {
    edl: undefined,
    renderLinks: undefined,
    state: undefined
  };

  addProperties(obj, {
    key,
    clip: edlPointer,
    hashableName: edlPointer.hashableName,
    parent,
    children: [],
    nameLinkPairs: []
  });

  addMethods(obj, {
    outstandingRequests: () => obj.state.outstandingRequests(),
    attributes: () => obj.state.attributes(),
    renderPointers: () => {
      let fn = obj.state.renderPointers;
      return fn ? fn() : [];
    }
  });

  TransitionToResolveEdlState(obj);
  if (edl) {
    TransitionToResolveLinksState(obj, edl);
    if (links && obj.state.resolveLink) {
      links.forEach((l, i) => obj.state.resolveLink(l, i));
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

function TransitionToResolveEdlState(harness) {
  let obj = { harness };

  function resolveEdl(part) {
    TransitionToResolveLinksState(harness, part.content);
  }

  harness.state = finalObject(obj, {
    attributes: {},
    outstandingRequests: () => [[harness.clip, resolveEdl]]
  });
}

function TransitionToResolveLinksState(harness, edl) {
  let unresolvedLinks = [...edl.links];
  let links = new Array(unresolvedLinks.length);
  
  let obj = {};

  function resolveLinkFromPart(part, index) {
    let link = part.content;
    resolveLink(link, index);
  }

  function resolveLink(link, index) {
    unresolvedLinks[index] = undefined;
    links[index] = link;

    if (unresolvedLinks.some(x => x)) {
      return;
    }

    TransitionToResolveLinkContentState(harness, links);
  }

  harness.edl = edl;

  if (edl.links.length > 0) {
    harness.state = obj;
  } else {
    TransitionToResolveLinkContentState(harness, []);
  }

  addMethods(obj, {
    attributes: {},
    outstandingRequests: () => unresolvedLinks.filter(x => x).map((x, i) => [x, p => resolveLinkFromPart(p, i)]),
    resolveLink
  });
}

function TransitionToResolveLinkContentState(harness, links) {
  let obj = {
  };

  harness.state = obj;
  harness.nameLinkPairs.push(...harness.edl.links.map((n, i) => [n, links[i]]));
  let renderPointers = undefined;

  function applyLinksToSelf() {
    renderPointers = RenderPointerCollection(harness.clip, EdlTypePointer(harness.edl.type), harness);
    renderPointers.tryAddAll(harness.renderLinks);
  }

  function createChildZettel() {
    harness.edl.clips.forEach((clip, index) => {
      let newKey = harness.key + "." + index.toString();
      
      if (clip.pointerType === "edl") {
        harness.children.push(EdlZettel(clip, harness, newKey));
      } else {
        let zettel = ZettelSchneider(clip, harness.renderLinks, newKey, harness).zettel();
        zettel.forEach(z => harness.children.push(z));
      }
    });
  }

  function outstandingLinkContent() {
    let rps = renderPointers.renderPointers();
    return rps.map(p => p.renderLink.outstandingRequests()).flat();
  }

  function resolveContent(part) {
    renderPointers.forEach(p => p.resolveContent(part));
  }

  function tryStateTransition() {
    if (outstandingLinkContent().length == 0) {
      TransitionToResolveEdlContentState(harness, renderPointers);
    }
  }

  function wrapContentRequest([clip, callback]) {
    return [clip, p => {
      callback(p);
      tryStateTransition();
    }];
  }

  function attributes() {
    if (renderPointers) {
      return renderPointers.attributes();
    } else { return {}; }
  }

  addMethods(obj, {
    outstandingRequests: () => outstandingLinkContent().map(wrapContentRequest),
    attributes,
    resolveContent,
    renderPointers: () => renderPointers.renderPointers()
  });

  harness.renderLinks = RenderLinkFactory(harness).renderLinks();

  applyLinksToSelf();
  createChildZettel();
  tryStateTransition();
}

function TransitionToResolveEdlContentState(harness, renderPointers) {
  let obj = {};

  function attributes() {
    if (renderPointers) {
      return renderPointers.attributes();
    } else { return {}; }
  }

  function resolveContent(part) {
    harness.children.forEach(c => c.tryAddPart(part));
  }

  addMethods(obj, {
    outstandingRequests: () => harness.children.map(z => z.outstandingRequests()).flat(),
    attributes,
    resolveContent
  });

  harness.state = obj;
}

export function makeTestEdlZettel(edl, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, key, edl);
  return edlz;
}

export function makeTestEdlZettelWithLinks(edl, links, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, key, edl, links);
  return edlz;
}

export function makeTestEdlAndEdlZettelFromLinks(links, linkNames, parent, edlPointer) {
  linkNames = linkNames ?? links.map((x, i) => LinkPointer(i.toString()));
  let edl = Edl(undefined, [], linkNames);
  let edlZettel = makeTestEdlZettelWithLinks(edl, links, { parent, edlPointer });
  return edlZettel;
}
