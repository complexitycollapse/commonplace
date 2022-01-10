import { finalObject } from '@commonplace/core';

export function StaticPartFetcher(origin) {
  let obj = {};

  async function getPart(clip) {
    let result = await fetchPart(clip);
    return result;
  }

  async function fetchPart(clip) {
    let response = await fetch(origin + clip.origin);
    if (clip.clipType === "span") {
      return await response.text();
    } else if (clip.clipType === "box") {
      return await response.blob();
    } else {
      throw `StaticPartFetcher.getPart did not understand clip type ${clip.clipType}`;
    }
  }

  async function getObject(pointer) {
    let response = await fetch(origin + pointer.origin);
    let object = await response.json();
    return object;
  }

  return finalObject(obj, {
    getPart,
    getObject
  });
}
