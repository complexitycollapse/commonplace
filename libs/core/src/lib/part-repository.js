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

    let missingParts = missingContentForEdl(doc);
    let required = missingParts.missingLinkNames
      .concat(missingParts.missingLinkContentPointers)
      .concat(missingParts.missingDocContent);

    return {
      docAvailable: true,
      linksAvailable: missingParts.missingLinkNames.length === 0,
      linkContentAvailable: missingParts.missingLinkContentPointers.length === 0,
      docContentAvailable: missingParts.missingDocContent.length === 0,
      allAvailable: required.length === 0,
      required
    };
  }

  function missingContentForEdl(edl) {
    // Links & link content
    let linkResults = edl.links.map(l => [l, getPartLocally(l)]);
    let missingLinkNames = linkResults.filter(l => l[1] === undefined).map(l => l[0]);
    let foundLinks = linkResults.filter(l => l[1] !== undefined).map(l => l[1].content);
    let missingLinkContentPointers = foundLinks.map(l => l.ends).flat().map(e => e.pointers).flat()
      .filter(p => p.specifiesContent && !getPartLocally(p));

    // Content
    let docContent = edl.clips.map(c => [c, getPartLocally(c)]);
    let missingDocContent = docContent.filter(c => c[1] === undefined).map(c => c[0]);

    // Reccur on child Edls.
    docContent.forEach(c => {
      let part = c[1];
      if (part === undefined) { return; }
      if (!part.content.isEdl) { return; }

      let childResults = missingContentForEdl(part.content);

      missingLinkNames = missingLinkNames.concat(childResults.missingLinkNames);
      missingLinkContentPointers = missingLinkContentPointers.concat(childResults.missingLinkContentPointers);
      missingDocContent = missingDocContent.concat(childResults.missingDocContent);
    });

    return {
      missingLinkNames,
      missingLinkContentPointers,
      missingDocContent
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
