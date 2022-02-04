import { addProperties, addMethods } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { RenderPointer } from './render-pointer';
import { RenderEndset } from './render-endset';
import { RenderPointerCollection } from './render-pointer-collection';
import { EdlPointer, LinkPointer } from '../pointers';
import { Part } from '../part';
import { Edl } from '../model';
import { EdlTypePointer } from '../Pointers/edl-type-pointer';

export function EdlZettel(edlPointer, parent, key) {
  let obj = {
    children: [],
    parent
  };
  obj.edl = undefined;
  obj.renderLinks = undefined;

  let unresolvedLinks = undefined;
  let links = undefined;
  let renderPointers = undefined;
  let nameLinkPairs = undefined;

  function resolveEdl(part) {
    obj.edl = part.content;

    if (obj.edl.links.length > 0) {
      unresolvedLinks = [...obj.edl.links];
      links = new Array(unresolvedLinks.length);
    } else {
      links = [];
      obj.renderLinks = [];
      applyLinksToSelf();
      createChildZettel();
    }
  }

  function resolveLink(part, index) {
    unresolvedLinks[index] = undefined;
    links[index] = part.content;

    if (unresolvedLinks.some(x => x)) {
      return;
    }

    unresolvedLinks = undefined;
    nameLinkPairs = obj.edl.links.map((n, i) => [n, links[i]]);
    obj.renderLinks = RenderLinkFactory(obj).renderLinks();
    applyLinksToSelf();
    createChildZettel();
  }

  function applyLinksToSelf() {
    function addLinks(source) {
      source.renderLinks.forEach(renderLink => renderLink.endsets.forEach(e => e.pointers.forEach(p => {
        if (p.pointerType === "edl" && p.edlName === edlPointer.edlName) {
          renderPointers.tryAdd(RenderPointer(p, RenderEndset(e, renderLink)));
        }
      })));
    }

    renderPointers = RenderPointerCollection(edlPointer, EdlTypePointer(obj.edl.type));
    
    for(let linkSource = obj; linkSource !== undefined; linkSource = linkSource.parent) {
      addLinks(linkSource);
    }
  }

  function createChildZettel() {
    obj.edl.clips.forEach((clip, index) => {
      let newKey = key + "." + index.toString();
      
      if (clip.pointerType === "edl") {
        obj.children.push(EdlZettel(clip, obj, newKey));
      } else {
        let zettel = ZettelSchneider(clip, obj.renderLinks, newKey).zettel();
        zettel.forEach(z => obj.children.push(z));
      }
    });
  }

  function outstandingRequests() {
    if (obj.edl === undefined) {
      return [[edlPointer, resolveEdl]];
    } else if (unresolvedLinks) {
      return unresolvedLinks.filter(x => x).map((x, i) => [x, p => resolveLink(p, i)]);
    } else {
      let rps = renderPointers.renderPointers();
      let linkContentRequests = rps.map(p => p.renderLink.outstandingRequests()).flat();
      if (linkContentRequests.length > 0) {
        return linkContentRequests;
      } else {
        return obj.children.map(z => z.outstandingRequests()).flat();
      }
    }
  }

  function attributes() {
    if (renderPointers) {
      return renderPointers.attributes();
    } else { return {}; }
  }

  addProperties(obj, {
    key,
    clip: edlPointer
  });

  addMethods(obj, {
    outstandingRequests,
    attributes,
    nameLinkPairs: () => nameLinkPairs ?? {}
  });

  return obj;
}

export function makeTestEdlZettel(edl, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, key);
  edlz.outstandingRequests()[0][1](Part(edlPointer, edl));
  return edlz;
}

export function makeTestEdlZettelWithLinks(edl, links, {edlPointer, parent, key} = {}) {
  key = key ?? "testKey";
  edlPointer = edlPointer ?? EdlPointer("an arbitrary name");
  let edlz = EdlZettel(edlPointer, parent, key);
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
