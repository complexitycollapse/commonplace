import { finalObject } from '@commonplace/core';

export function StaticPartFetcher(origin, fetch) {
  let obj = {};

  async function getPart(pointer) {
    let url = origin + pointer.origin;
    let response = await fetch(url);
    if (response.ok) { return retrieveAndParse(pointer, response); }
    else {
      console.log(`Failed to load ${JSON.stringify(pointer)} from URL "${url}". Status: ${response.status}`);
      return undefined;
    }
  }

  async function retrieveAndParse(pointer, response) {
    if (pointer.isClip) {
      if (pointer.clipType === "span") {
        return await response.text();
      } else if (pointer.clipType === "box") {
        return await response.blob();
      } else {
        throw `StaticPartFetcher.getPart did not understand clip type ${pointer.clipType}`;
      }
    } else {
      return await response.json();
    }
  }

  return finalObject(obj, {
    getPart
  });
}
