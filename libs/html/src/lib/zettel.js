import { addProperties, addMethods, Endset } from '@commonplace/core';
import { ZettelSchneider } from './zettel-schneider';

export function Zettel(edit) {
  let obj = {
    content: undefined,
    key: undefined
  };

  addProperties(obj, {
    edit,
    endsets: [],
  });

  function makeModifiedEndset(es, link, index) {
    let newEndset = Endset(es.name, es.pointer);
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
    let parts = ZettelSchneider(edit, [link], obj.key).zettel();

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
    function isFound(ourEndset) {
      if (otherZettel.hasModifiedEndset(ourEndset)) {
          return true;
        }
      return false;
    }

    if (otherZettel === undefined) {
      return [...obj.endsets];
    }
  
    let openings = [];
  
    obj.endsets.forEach(ourEndset => {
      if (!isFound(ourEndset)) { openings.push(ourEndset); }
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
