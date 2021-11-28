import { addProperties } from '@commonplace/core';

export function zettel(edit, endsets) {
  let obj = {};

  addProperties(obj, {
    edit,
    endsets,
  });

  return obj;
}
