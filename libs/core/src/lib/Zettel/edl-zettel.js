import { addProperties, addMethods } from '../utils';
import { ZettelSchneider } from './zettel-schneider';
import { StructureElement } from './structure-element';
import { RenderLinkFactory } from './render-link-factory';

export function EdlZettel(edlPointer, parent, key) {
  let obj = StructureElement([], {
    children: [],
    parent,
    clip: edlPointer
  });
  obj.edl = undefined;
  obj.renderLinks = undefined;

  let unresolvedLinks = undefined;
  let links = undefined;

  function resolveEdl(part) {
    obj.edl = part.content;

    if (obj.edl.links.length > 0) {
      unresolvedLinks = [...obj.edl.links];
      links = new Array(unresolvedLinks.length);
    } else {
      links = [];
      obj.renderLinks = [];
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
    obj.renderLinks = RenderLinkFactory(obj.edl.links.map((n, i) => [n.hashableName(), links[i]])).renderLinks();
    createChildZettel();
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
      return obj.children.map(z => z.outstandingRequests()).flat();
    }
  }

  addProperties(obj, {
    key
  });

  addMethods(obj, {
    outstandingRequests,
    style() { return {}; }
  });

  return obj;
}
