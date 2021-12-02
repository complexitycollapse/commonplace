import { addProperties, addMethods, endset } from '@commonplace/core';

export function Zettel(edit) {
  let obj = {};

  function makeModifiedEndset(es, link, index) {
    let newEndset = endset(es.name, es.set);
    newEndset.link = link;
    newEndset.index = index;
    return newEndset;
  }

  function addEndset(endset, link) {
    let index = link.endsets.indexOf(endset);
    if (obj.endsets.find(e => e.link === link && e.index === index)) {
      return;
    }
    obj.endsets.push(makeModifiedEndset(endset, link, index));
  }

  addProperties(obj, {
    edit,
    endsets: [],
  });

  addMethods(obj, {
    addEndset
  });

  return obj;
}
