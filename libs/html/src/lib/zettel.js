import { addProperties, addMethods, Endset, testing } from '@commonplace/core';
import { SingleZettelSchneider } from './zettel-schneider';

export function Zettel(clip) {
  let obj = {
    content: undefined,
    key: undefined
  };

  addProperties(obj, {
    clip,
    endsets: [],
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
    if (hasModifiedEndset(newEndset)) {
      return;
    }
    obj.endsets.push(newEndset);
  }

  function addLink(link) {
    let parts = SingleZettelSchneider(clip, [link], obj.key).zettel();

    parts.forEach(z => {
      obj.endsets.forEach(e => {
        if (!z.hasModifiedEndset(e)) {
          z.endsets.push(e);
        }
        z.content = obj.content;
      });
    });

    return parts;
  }

  function endsetsNotInOther(otherZettel) {
    if (otherZettel === undefined) {
      return [...obj.endsets];
    }
  
    let openings = [];
  
    obj.endsets.forEach(ourEndset => {
      if (!otherZettel.hasModifiedEndset(ourEndset)) {
        openings.push(ourEndset);
      }
    });
  
    return openings;
  }

  function hasModifiedEndset(endset) {
    return obj.endsets.find(ours => 
      endset.link === ours.link && endset.index === ours.index);
  }

  addMethods(obj, {
    addEndset,
    addLink,
    endsetsNotInOther,
    hasModifiedEndset
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
  }
};
