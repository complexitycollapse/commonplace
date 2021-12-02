import { addProperties, addMethods, Endset } from '@commonplace/core';
import { ZettelSchneider } from './zettel-schneider';

export function Zettel(edit) {
  let obj = {};

  function makeModifiedEndset(es, link, index) {
    let newEndset = Endset(es.name, es.set);
    newEndset.link = link;
    newEndset.index = index;
    return newEndset;
  }

  function addEndset(endset, link) {
    let index = link.endsets.indexOf(endset);
    if (alreadyHasEndset(obj, link, index)) {
      return;
    }
    obj.endsets.push(makeModifiedEndset(endset, link, index));
  }

  function addLink(link) {
    let parts = ZettelSchneider(edit, [link]).zettel();

    parts.forEach(z => {
      obj.endsets.forEach(e => {
        if (!alreadyHasEndset(z, e.link, e.index)) {
          z.endsets.push(e);
        }
      });
    });

    return parts;
  }

  addProperties(obj, {
    edit,
    endsets: [],
  });

  addMethods(obj, {
    addEndset,
    addLink
  });

  return obj;
}

function alreadyHasEndset(zettel, link, index) {
  return zettel.endsets.find(e => e.link === link && e.index === index);
}
