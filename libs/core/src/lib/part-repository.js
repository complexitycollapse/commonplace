import { finalObject, listMapFromList } from "@commonplace/utils";
import { LeafCache } from "./leaf-cache";

export function PartRepository(fetcher) {
  let cache = LeafCache();
  let obj = { cache };

  function getPartLocally(pointer) {
    let cached = cache.getPart(pointer);
    if (cached[0]) {
      return cached[1];
     }

     return undefined;
  }

  async function getPart(pointer) {
    let cached = getPartLocally(pointer);
    if (cached) { return cached; }

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

  async function getPartsForOrigin(pointers) {
    let results = [];
    for (let i = 0; i < pointers.length; i++) {
      let pointer = pointers[i];
      let part = await getPart(pointer);
      results.push(part);
    }
    // TODO: need to handle the case where one of these fails
    return results;
  }

  function getManyParts(requests) {
    let asHash = listMapFromList(r => r.origin, r => r, requests);
    return Promise.all([...asHash.values()].map(rs => getPartsForOrigin(rs)));
  }

  return finalObject(obj, {
    getPart,
    getManyParts,
    getPartLocally
  });
}

export function MockPartRepository(parts) {
  let repo = PartRepository({ getPart: async () => [false] });

  let obj = {
    repo,
    getPartLocally: pointer => repo.getPartLocally(pointer),
    addParts: parts => {
      parts.forEach(part => repo.cache.addPart(part));
    },
    getPart: repo.getPart,
    getManyParts: repo.getManyParts
  }

  obj.addParts(parts);
  return obj;
}
