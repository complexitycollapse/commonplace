import { addProperties, addMethods, memoize } from '@commonplace/utils';
import { Span, testing } from '@commonplace/core';
import { ZettelSchneider } from './zettel-schneider';
import { RenderPointerCollection } from './render-pointer-collection';
import { Attributes } from '../Attributes/attributes';

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
    attributes: memoize(attributes),
    sequences: []
  });

  function addPointer(pointer, end, link) {
    let renderPointer = link.createRenderPointer(pointer, end);
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

  function sequenceDetails() {
    return obj.renderPointers.renderPointers().map(p => p.sequenceDetails()).flat();
  }

  obj.renderPointers.addDefaults(containingEdl.defaults);

  addMethods(obj, {
    addLink,
    tryAddPart,
    part: () => contentPart,
    outstandingRequests,
    setOnUpdate,
    addPointer,
    sequenceDetails
  });

  return obj;
}

function clipArraysEqual(actual, expected) {
  if (actual === undefined || expected === undefined) { return false; }
  if (actual.length !== expected.length) { return false; }

  for (let j = 0; j < actual.length; ++j) {
    if (!testing.toEqualClip(actual[j], expected[j]).pass) {
      return false;
    }
  }

  return true;
}

export let zettelTesting = {
  hasEnd(zettel, link, index = 0) {
    let expectedEnd = link.ends[index];
    let actualEnds = zettel.renderPointers.renderPointers().map(p => p.renderEnd);

    for(let i = 0; i < actualEnds.length; ++i) {
      let candidate = actualEnds[i];
      if (candidate.name === expectedEnd.name
          && candidate.index === index
          && candidate.renderLink.type === link.type) {
        if (clipArraysEqual(candidate.pointers, expectedEnd.pointers)) {
          return {
            message: () => `did not expect zettel to contain ${JSON.stringify(expectedEnd)}`,
            pass: true
          };
        }
      }
    }

    return {
      message: () => `did not find end ${JSON.stringify(expectedEnd)}`,
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
