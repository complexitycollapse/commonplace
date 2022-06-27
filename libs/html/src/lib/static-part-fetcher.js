import { finalObject } from '@commonplace/utils';

export function StaticPartFetcher(origin, fetch) {
  let obj = {};

  async function getPart(pointer) {
    let url = origin + pointer.origin;
    let response = await fetch(url);
    if (response.ok) { 
      let part = await pointer.partBuilder(response);
      return [true, part];
    }
    else {
      return [false, `Failed to load ${JSON.stringify(pointer)} from URL "${url}". Status: ${response.status}`];
    }
  }

  return finalObject(obj, {
    getPart
  });
}
