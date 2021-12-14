import { finalObject } from '@commonplace/core';

export function StaticPartFetcher(origin) {
  let obj = {};

  async function getPart(edit) {
    let result = await fetchPart(edit);
    return result;
  }

  async function fetchPart(edit) {
    let response = await fetch(origin + edit.origin);
    if (edit.editType === "span") {
      return await response.text();
    } else if (edit.editType === "box") {
      return await response.blob();
    } else {
      throw `StaticPartFetcher.getPart did not understand edit type ${edit.editType}`;
    }
  }

  async function getObject(name) {
    let response = await fetch(origin + name);
    let object = await response.json();
    return object;
  }

  return finalObject(obj, {
    getPart,
    getObject
  });
}
