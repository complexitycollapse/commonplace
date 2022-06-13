import { addProperties, addMethods, memoize } from '../utils';
import { Span, toEqualClip } from '../pointers';
import { ZettelSchneider } from './zettel-schneider';
import { RenderPointerCollection } from './render-pointer-collection';
import { Attributes } from './attributes';

export function Zettel(clip, containingEdl) {
  let obj = {};
  let onUpdate = undefined;
  let contentPart = undefined;
  obj.key = undefined;

  function attributes() {
    return Attributes(obj, containingEdl.attributes(), obj.renderPointers.pointerStack(), obj.renderPointers.defaultsStack());
  }

  addProperties(obj, {
    clip,
    isSegment: false,
    renderPointers: RenderPointerCollection(clip, undefined, containingEdl),
    containingEdl,
    attributes: memoize(attributes)
  });

  function addPointer(pointer, endset, link) {
    let renderPointer = link.createRenderPointer(pointer, endset);
    obj.renderPointers.tryAddRenderPointer(renderPointer);
  }

  function addLink(link) {
    let newZettel = ZettelSchneider(clip, [link], obj.key, containingEdl).zettel();

    newZettel.forEach(z => {
      obj.renderPointers.renderPointers().forEach(p => z.renderPointers.tryAddRenderPointer(p));
      if (contentPart) { z.tryAddPart(contentPart); }
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

  function outstandingRequests() {
    let outstanding = [];
    
    let linkContentRequests = obj.renderPointers.renderPointers().map(p => p.renderLink.outstandingRequests()).flat();
    if (linkContentRequests.length > 0) {
      return linkContentRequests;
    }

    if (contentPart === undefined) {
      outstanding.push([clip, p => tryAddPart(p)]);
    }

    return outstanding;
  }

  obj.renderPointers.addDefaults(containingEdl.defaults);

  addMethods(obj, {
    addLink,
    tryAddPart,
    part: () => contentPart,
    outstandingRequests,
    setOnUpdate,
    addPointer
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
    let actualEndsets = zettel.renderPointers.renderPointers().map(p => p.renderEndset);

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
