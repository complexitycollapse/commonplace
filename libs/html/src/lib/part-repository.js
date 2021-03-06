import { LeafCache } from "@commonplace/core";
import { finalObject, listMapFromList } from "@commonplace/utils";

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
      let clipResult = pointer.clipPart(part);
      if (clipResult[0]) { return clipResult[1]; }
      else {
        console.error(`Error when fetching leaf for pointer ${JSON.stringify(pointer)}. Could not clip the result to the pointer.`);
        return undefined;
      }
    } else {
      console.error(fetched[1]);
      return undefined;
    }
  }

  async function getPartsForOrigin(requests) {
    let results = [];
    for (let i = 0; i < requests.length; i++) {
      let request = requests[i];
      results.push(request[0]);
      let part = await getPart(request[0]);
      // TODO: need to handle the error case too. An ignored request will
      // simply be repeated in an infinite loop.
      if (part) { request[1](part); }
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