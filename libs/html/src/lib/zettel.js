import { addProperties, addMethods, endset } from '@commonplace/core';

export function zettel(edit) {
  let obj = {};

  function makeModifiedEndset(es, link) {
    let newEndset = endset(es.name, es.set);
    newEndset.link = link;
    return newEndset;
  }

  function addEndset(endset, link) {
    obj.endsets.push(makeModifiedEndset(endset, link));
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
