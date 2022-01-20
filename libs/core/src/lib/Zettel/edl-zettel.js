import { addProperties, addMethods } from '../utils';
import { SingleZettelSchneider } from './zettel-schneider';
import { StructureElement } from './structure-element';

export function EdlZettel(edlPointer, endsets, key) {
  let obj = StructureElement(endsets, {
    children: []
  });
  obj.edl = undefined;

  let unresolvedLinks = undefined;
  let links = undefined;

  function resolveEdl(part) {
    obj.edl = part.content;

    if (obj.edl.links.length > 0) {
      unresolvedLinks = [...obj.edl.links];
      links = new Array(unresolvedLinks.length);
    } else {
      links = [];
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
    createChildZettel();
  }

  function createChildZettel() {
    obj.edl.clips.forEach((clip, index) => {
      let newKey = key + "." + index.toString();
      
      if (clip.pointerType === "edl") {
        obj.children.push(EdlZettel(clip, endsets, newKey));
      } else {
        let zettel = SingleZettelSchneider(clip, endsets.map(e => e.renderLink), newKey).zettel();
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
    outstandingRequests
  });

  return obj;
}
