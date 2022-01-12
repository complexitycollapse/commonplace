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

  async function getPartsForOrigin(pointers) {
    let results = [];
    for (let i = 0; i < pointers.length; i++) {
      results.push(await getPart(pointers[i]));
    }
    return results;
  }

  function getManyParts(pointers) {
    let asHash = listMapFromList(p => p.origin, p => p, pointers);
    return Promise.all([...asHash.values()].map(ps => getPartsForOrigin(ps))).then(xs => [].concat(...xs));
  }

  return finalObject(obj, {
    getPart,
    getManyParts
  });
}