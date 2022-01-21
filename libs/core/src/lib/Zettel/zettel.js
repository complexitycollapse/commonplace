import { addProperties, addMethods } from '../utils';
import { Span, toEqualClip } from '../pointers';
import { ZettelSchneider } from './zettel-schneider';
import { RenderEndset } from './render-endset';
import { RenderPointer } from './render-pointer';

export function Zettel(clip) {
  let obj = {};
  let onUpdate = undefined;
  let contentPart = undefined;
  obj.key = undefined;

  addProperties(obj, {
    clip,
    isSegment: false,
    renderPointers: []
  });

  function addPointer(pointer, endset, link) {
    let renderEndset = RenderEndset(endset, link);
    let renderPointer = RenderPointer(pointer, renderEndset);
    if (obj.hasRenderEndset(renderEndset)) {
      return;
    }
    obj.renderPointers.push(renderPointer);
  }

  function addLink(link) {
    let newZettel = ZettelSchneider(clip, [link], obj.key).zettel();

    newZettel.forEach(z => {
      obj.renderPointers.forEach(p => {
        if (!z.hasRenderEndset(p.renderEndset)) {
          z.renderPointers.push(p);
        }
        if (contentPart) { z.tryAddPart(contentPart); }
      });
    });

    return newZettel;
  }

  function tryAddPart(part) {
    if (part.pointer.engulfs(clip)) {
      contentPart = clip.clipPart(part)[1];
      if (onUpdate) { onUpdate(); }
    }
  }

  function setOnUpdate(callback) {
    onUpdate = callback;
  }

  function style() {
    let styles = obj.renderPointers.map(e => e.renderLink.style());
    return styles;
  }

  function outstandingRequests() {
    let outstanding = [];
    
    if (contentPart === undefined) {
      outstanding.push([clip, p => tryAddPart(p)]);
    }

    return outstanding;
  }

  function hasRenderEndset(endset) {
    return obj.renderPointers.find(ours => 
      endset.renderLink === ours.renderEndset.renderLink && endset.index === ours.renderEndset.index);
  }

  addMethods(obj, {
    addLink,
    tryAddPart,
    style,
    part: () => contentPart,
    outstandingRequests,
    setOnUpdate,
    addPointer,
    hasRenderEndset
  });

  return obj;
}

function clipArraysEqual(actual, expected) {
  if (actual === undefined || expected === undefined) { return false; }
  if (actual.length !== expected.length) { return false; }

  for (let j = 0; j < actual.length; ++j) {
    if (!toEqualClip(actual[j], expected[j]).pass) {
      return false;
    }
  }

  return true;
}

export let zettelTesting = {
  hasEndset(zettel, link, index = 0) {
    let expectedEndset = link.endsets[index];
    let actualEndsets = zettel.renderPointers.map(p => p.renderEndset);

    for(let i = 0; i < actualEndsets.length; ++i) {
      let candidate = actualEndsets[i];
      if (candidate.name === expectedEndset.name
          && candidate.index === index
          && candidate.renderLink.type === link.type) {
        if (clipArraysEqual(candidate.pointers, expectedEndset.pointers)) {
          return {
            message: () => `did not expect zettel to contain ${JSON.stringify(expectedEndset)}`,
            pass: true
          };
        }
      }
    }

    return {
      message: () => `did not find endset ${JSON.stringify(expectedEndset)}`,
      pass: false
    };
  },

  makeZettel(start, length) {
    return Zettel(Span("origin", start, length));
  },
  
  makeZettelArray(...array) {
    let result = [];
    while(array.length > 0) {
      result.push(zettelTesting.makeZettel(array.shift(), array.shift()));
    }
    return result;
  },
};
