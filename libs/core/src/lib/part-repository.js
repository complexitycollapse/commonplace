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

  function docStatus(docName) {
    let docPart = getPartLocally(docName);

    if (docPart === undefined) { return { required: [docName] }; }

    let doc = docPart.content;
    let linkResults = doc.links.map(l => [l, getPartLocally(l)]);
    let missingLinkNames = linkResults.filter(l => l[1] === undefined).map(l => l[0]);
    let foundLinks = linkResults.filter(l => l[1] !== undefined).map(l => l[1].content);
    let linkContentPointers = foundLinks.map(l => l.ends).flat().map(e => e.pointers).flat()
      .filter(p => p.specifiesContent && !getPartLocally(p));
    let docContent = doc.clips.filter(c => !getPartLocally(c));
    let required = missingLinkNames.concat(linkContentPointers).concat(docContent);

    return {
      docAvailable: true,
      linksAvailable: missingLinkNames.length === 0,
      linkContentAvailable: linkContentPointers.length === 0,
      docContentAvailable: docContent.length === 0,
      allAvailable: required.length === 0,
      required
    };
  }

  return finalObject(obj, {
    getPart,
    getManyParts,
    getPartLocally,
    docStatus
  });
}

export function MockPartRepository(parts) {
  let repo = PartRepository(() => undefined);

  let obj = {
    repo,
    getPartLocally: part => repo.getPartLocally(part),
    addParts: parts => {
      parts.forEach(part => repo.cache.addPart(part));
    }
  }

  obj.addParts(parts);
  return obj;
}
