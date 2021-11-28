import { addProperties, endset } from '@commonplace/core';

export function zettel(edit, endsets) {
  let obj = {};

  function makeModifiedEndset(pair) {
    let newEndset = endset(pair.endset.name, pair.endset.set);
    newEndset.link = pair.link;
    return newEndset;
  }

  addProperties(obj, {
    edit,
    endsets: endsets.map(makeModifiedEndset),
  });

  return obj;
}
