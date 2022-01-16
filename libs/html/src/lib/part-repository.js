import { finalObject, LeafCache, listMapFromList } from "@commonplace/core";

export function PartRepository(fetcher) {
  let obj = {};
  let cache = LeafCache();

  async function getPart(pointer) {
    let cached = cache.getPart(pointer);
    if (cached[0]) { 
      return cached[1];
     }

    let fetched = await fetcher.getPart(pointer);
    if (fetched[0]) {
      let part = fetched[1];
      cache.addPart(part);
      return pointer.clipPart(part)[1];
    } else {
      console.log(fetched[1]);
      return undefined;
    }
  }

  async function getPartsForOrigin(requests) {
    let results = [];
    for (let i = 0; i < requests.length; i++) {
      let request = requests[i];
      results.push(request[0]);
      request[1](await getPart(request[0]));
    }
    return results;
  }

  function getManyParts(requests) {
    let asHash = listMapFromList(r => r[0].origin, r => r, requests);
    return Promise.all([...asHash.values()].map(rs => getPartsForOrigin(rs)));
  }

  return finalObject(obj, {
    getPart,
    getManyParts
  });
}