import { addProperties, addMethods } from '../utils';
import { Endset, Link } from '../model';
import { Span, toEqualClip } from '../pointers';
import { SingleZettelSchneider } from './zettel-schneider';
import { StructureElement } from './structure-element';
import { RenderLink } from './render-link';
import { RenderEndset } from './render-endset';

export function Zettel(clip) {
  let obj = StructureElement([]);
  let onUpdate = undefined;
  let contentPart = undefined;
  obj.key = undefined;

  addProperties(obj, {
    clip,
    isSegment: false
  });

  function addEndset(endset, link) {
    let newEndset = RenderEndset(endset, link);
    if (obj.hasRenderEndset(newEndset)) {
      return;
    }
    obj.endsets.push(newEndset);
    if (link.isStructural) { obj.structuralEndsets.push(newEndset) };
  }

  function addLink(link) {
    let newZettel = SingleZettelSchneider(clip, [link], obj.key).zettel();

    newZettel.forEach(z => {
      obj.endsets.forEach(e => {
        if (!z.hasRenderEndset(e)) {
          z.endsets.push(e);
          if (link.isStructural) { obj.structuralEndsets.push(e) };
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
    let styles = obj.endsets.map(e => e.renderLink.style());
    return styles;
  }

  function outstandingRequests() {
    let outstanding = [];
    
    if (contentPart === undefined) {
      outstanding.push([clip, p => tryAddPart(p)]);
    }

    return outstanding;
  }

  addMethods(obj, {
    addEndset,
    addLink,
    tryAddPart,
    style,
    part: () => contentPart,
    outstandingRequests,
    setOnUpdate
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
    let actualEndsets = zettel.endsets;

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
  
  addEndsets(zettel, ...endsetNames) {
    return endsetNames.map(name => zettelTesting.addEndset(zettel, name));
  },
  
  addEndset(zettel, endsetName) {
    let endset = Endset(endsetName, []);
    let link = RenderLink(Link("paragraph", endset));
    zettel.addEndset(endset, link);
    return [endset, link];
  },

  addExistingEndsets(zettel, endsetsAndLinks){
    endsetsAndLinks.forEach(el => zettel.addEndset(el[0], el[1]));
  }
};
