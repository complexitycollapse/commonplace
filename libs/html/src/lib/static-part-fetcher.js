import { finalObject } from '@commonplace/core';

export function StaticPartFetcher(origin, fetch) {
  let obj = {};

  async function getPart(pointer) {
    let url = origin + pointer.origin;
    let response = await fetch(url);
    if (response.ok) { 
      let part = await pointer.partBuilder(pointer, response);
      return part;
    }
    else {
      console.log(`Failed to load ${JSON.stringify(pointer)} from URL "${url}". Status: ${response.status}`);
      return undefined;
    }
  }

  return finalObject(obj, {
    getPart
  });
}
