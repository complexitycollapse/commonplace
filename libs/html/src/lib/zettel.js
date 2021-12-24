import { addProperties, addMethods, Endset, testing, Link, Span } from '@commonplace/core';
import { SingleZettelSchneider } from './zettel-schneider';
import { StructureElement } from './structure-element';
import { RenderLink } from './render-link';

export function Zettel(clip) {
  let base = StructureElement([]);

  let obj = Object.create(base);
  obj.content = undefined;
  obj.key = undefined;

  addProperties(obj, {
    clip,
    isNode: false
  });

  function makeModifiedEndset(es, link, index) {
    let newEndset = Endset(es.name, es.pointers);
    newEndset.link = link;
    newEndset.index = index;
    return newEndset;
  }

  function addEndset(endset, link) {
    let index = link.endsets.indexOf(endset);
    let newEndset = makeModifiedEndset(endset, link, index);
    if (obj.hasModifiedEndset(newEndset)) {
      return;
    }
    obj.endsets.push(newEndset);
    if (link.isStructural) { obj.structuralEndsets.push(newEndset) };
  }

  function addLink(link) {
    let parts = SingleZettelSchneider(clip, [link], obj.key).zettel();

    parts.forEach(z => {
      obj.endsets.forEach(e => {
        if (!z.hasModifiedEndset(e)) {
          z.endsets.push(e);
          if (link.isStructural) { obj.structuralEndsets.push(e) };
        }
        z.content = obj.content;
      });
    });

    return parts;
  }

  function endsetsNotInOther(other, onlyStructural) {
    if (other === undefined) {
      return [...obj.endsets];
    }
    return base.endsetsNotInOther(other, onlyStructural);
  }

  addMethods(obj, {
    addEndset,
    addLink,
    endsetsNotInOther
  });

  return obj;
}

let toEqualClip = testing.clips.toEqualClip;

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
          && candidate.link.type === link.type) {
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
