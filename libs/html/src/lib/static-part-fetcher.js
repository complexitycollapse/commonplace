import { finalObject } from '@commonplace/utils';

export function StaticPartFetcher(origin, fetch) {
  let obj = {};

  async function getPart(pointer) {
    let url = origin + pointer.origin;
    let response = await fetch(url);
    if (response.ok) {
      let part = await pointer.partBuilder(response, pointer.origin);
      return [true, part];
    }
    else {
      let msg = `Failed to load ${JSON.stringify(pointer)} from URL "${url}". Status: ${response.status}`;
      return [false, msg];
    }
  }

  return finalObject(obj, {
    getPart
  });
}
