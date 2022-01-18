import { addProperties, addMethods } from './utils';
import { SingleZettelSchneider } from './zettel-schneider';
import { StructureElement } from './structure-element';

export function EdlZettel(edl, endsets, key) {
  let obj = StructureElement(endsets, {
    children: []
  });

  edl.clips.forEach((clip, index) => {
    let newKey = key + "." + index.toString();
    
    if (clip.pointerType === "edl") {
      obj.children.push(EdlZettelDummy(clip, endsets, obj.children, index, newKey));
    } else {
      let zettel = SingleZettelSchneider(clip, endsets.map(e => e.renderLink), newKey).zettel();
      zettel.forEach(z => obj.children.push(z));
    }
  });

  function outstandingRequests() {
    return obj.children.map(z => z.outstandingRequests()).flat();
  }

  addProperties(obj, {
    edl,
    key
  });

  addMethods(obj, {
    outstandingRequests
  });

  return obj;
}

function EdlZettelDummy(edlPointer, endsets, parentChildCollection, childIndex, key) {
  return {
    outstandingRequests: () => [
      [
        edlPointer,
        p => parentChildCollection[childIndex] = EdlZettel(p.content, endsets, key)
      ]
    ],
    children: [],
    key
  };
}
