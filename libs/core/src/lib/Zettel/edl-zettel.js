import { addProperties, addMethods, finalObject } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { RenderPointerCollection } from './render-pointer-collection';
import { EdlPointer, LinkPointer } from '../pointers';
import { Edl } from '../model';
import { EdlTypePointer } from '../Pointers/edl-type-pointer';

export function EdlZettel(edlPointer, parent, key, edl, links) {
  let obj = {
    edl: undefined,
    renderLinks: undefined,
    state: undefined,
  };

  addProperties(obj, {
    key,
    clip: edlPointer,
    hashableName: edlPointer.hashableName,
    parent,
    children: []
  });

  addMethods(obj, {
    outstandingRequests: () => obj.state.outstandingRequests(),
    attributes: () => obj.state.attributes(),
    nameLinkPairs: () => obj.state.nameLinkPairs()
  });

  TransitionToResolveEdlState(obj);
  if (edl) {
    TransitionToResolveLinksState(obj, edl);
    if (links && obj.state.resolveLink) {
      links.forEach((l, i) => obj.state.resolveLink(l, i));
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
    nameLinkPairs: () => [],
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

    TransitionToResolveContentState(harness, links);
  }

  harness.edl = edl;

  if (edl.links.length > 0) {
    harness.state = obj;
  } else {
    TransitionToResolveContentState(harness, []);
  }

  addMethods(obj, {
    attributes: {},
    nameLinkPairs: () => [],
    outstandingRequests: () => unresolvedLinks.filter(x => x).map((x, i) => [x, p => resolveLinkFromPart(p, i)]),
    resolveLink
  });
}

function TransitionToResolveContentState(harness, links) {
  let obj = {
  };

  harness.state = obj;
  let nameLinkPairs = harness.edl.links.map((n, i) => [n, links[i]]);
  let renderPointers = undefined;

  function applyLinksToSelf() {
    renderPointers = RenderPointerCollection(harness.clip, EdlTypePointer(harness.edl.type));
    renderPointers.tryAddAll(harness.renderLinks);
  }

  function createChildZettel() {
    harness.edl.clips.forEach((clip, index) => {
      let newKey = harness.key + "." + index.toString();
      
      if (clip.pointerType === "edl") {
        harness.children.push(EdlZettel(clip, harness, newKey));
      } else {
        let zettel = ZettelSchneider(clip, harness.renderLinks, newKey).zettel();
        zettel.forEach(z => harness.children.push(z));
      }
    });
  }

  function outstandingRequests() {
    let rps = renderPointers.renderPointers();
    let linkContentRequests = rps.map(p => p.renderLink.outstandingRequests()).flat();
    if (linkContentRequests.length > 0) {
      return linkContentRequests;
    } else {
      return harness.children.map(z => z.outstandingRequests()).flat();
    }
  }

  function attributes() {
    if (renderPointers) {
      return renderPointers.attributes();
    } else { return {}; }
  }

  addMethods(obj, {
    outstandingRequests,
    attributes,
    nameLinkPairs: () => nameLinkPairs ?? {}
  });

  harness.renderLinks = RenderLinkFactory(harness).renderLinks();

  applyLinksToSelf();
  createChildZettel();

  return obj;
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

export function makeTestEdlAndEdlZettelFromLinks(links, linkNames, parent) {
  linkNames = linkNames ?? links.map((x, i) => LinkPointer(i.toString()));
  let edl = Edl(undefined, [], linkNames);
  let edlZettel = makeTestEdlZettelWithLinks(edl, links, { parent });
  return edlZettel;
}
