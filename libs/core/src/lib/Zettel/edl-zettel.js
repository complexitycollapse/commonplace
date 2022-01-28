import { addProperties, addMethods } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { RenderLinkFactory } from './render-link-factory';
import { RenderPointer } from './render-pointer';
import { RenderEndset } from './render-endset';
import { RenderPointerCollection } from './render-pointer-collection';

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

  function resolveEdl(part) {
    obj.edl = part.content;

    if (obj.edl.links.length > 0) {
      unresolvedLinks = [...obj.edl.links];
      links = new Array(unresolvedLinks.length);
    } else {
      links = [];
      obj.renderLinks = {};
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
    obj.renderLinks = RenderLinkFactory(obj.edl.links.map((n, i) => [n.hashableName, links[i]])).renderLinks();
    applyLinksToSelf();
    createChildZettel();
  }

  function applyLinksToSelf() {
    function addLinks(source) {
      Object.values(source.renderLinks).forEach(l => l.endsets.forEach(e => e.pointers.forEach(p => {
        if (p.pointerType === "edl" && p.edlName === edlPointer.edlName) {
          renderPointers.tryAdd(RenderPointer(p, RenderEndset(e, l)));
        }
      })));
    }

    renderPointers = RenderPointerCollection(edlPointer, obj.edl.type);
    
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
        let zettel = ZettelSchneider(clip, Object.values(obj.renderLinks), newKey).zettel();
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
    attributes
  });

  return obj;
}
