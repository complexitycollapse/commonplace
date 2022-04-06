import { addProperties, addMethods, finalObject } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { RenderPointerCollection } from './render-pointer-collection';
import { EdlPointer, LinkPointer } from '../pointers';
import { Part } from '../part';
import { Edl } from '../model';
import { EdlTypePointer } from '../Pointers/edl-type-pointer';

export function EdlZettelFromPointer(edlPointer, parent, key) {
  let edlZ = EdlZettel(parent, edlPointer, key);
  TransitionToResolveEdlState(edlZ);
  return edlZ;
}

function EdlZettel(parent, edlPointer, key) {
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

  return obj;
}

function TransitionToResolveEdlState(harness) {
  let obj = { harness };

  function resolveEdl(part) {
    let edl = part.content;
    harness.edl = edl;
    TransitionToResolveLinksState(harness);
  }

  harness.state = finalObject(obj, {
    attributes: {},
    nameLinkPairs: () => [],
    outstandingRequests: () => [[harness.clip, resolveEdl]]
  });
}

function TransitionToResolveLinksState(harness) {
  let unresolvedLinks = [...harness.edl.links];
  let links = new Array(unresolvedLinks.length);
  
  let obj = {};

  function resolveLink(part, index) {
    unresolvedLinks[index] = undefined;
    links[index] = part.content;

    if (unresolvedLinks.some(x => x)) {
      return;
    }

    TransitionToResolveContentState(harness, links);
  }

  if (harness.edl.links.length > 0) {
    harness.state = obj;
  } else {
    TransitionToResolveContentState(harness, []);
  }

  addMethods(obj, {
    attributes: {},
    nameLinkPairs: () => [],
    outstandingRequests: () => unresolvedLinks.filter(x => x).map((x, i) => [x, p => resolveLink(p, i)])
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
        harness.children.push(EdlZettelFromPointer(clip, harness, newKey));
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
  let edlz = EdlZettelFromPointer(edlPointer, parent, key);
  edlz.outstandingRequests()[0][1](Part(edlPointer, edl));
  return edlz;
}

export function makeTestEdlZettelWithLinks(edl, links, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettelFromPointer(edlPointer, parent, key);
  edlz.outstandingRequests()[0][1](Part(edlPointer, edl));
  let linkRequests = edlz.outstandingRequests();
  links.forEach((link, i) => linkRequests[i][1](Part(linkRequests[i][0], link)));
  return edlz;
}

export function makeTestEdlAndEdlZettelFromLinks(links, linkNames, parent) {
  linkNames = linkNames ?? links.map((x, i) => LinkPointer(i.toString()));
  let edl = Edl(undefined, [], linkNames);
  let edlZettel = makeTestEdlZettelWithLinks(edl, links, { parent });
  return edlZettel;
}
