import { finalObject, listMapFromList } from "@commonplace/utils";
import { LeafCache } from "./leaf-cache";
import { defaultsPointer } from "./defaults";

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

  function docStatus(docName) {
    let defaultsDocPart = getPartLocally(defaultsPointer);

    if (defaultsDocPart === undefined) {
      return {
        required: [defaultsPointer]
      };
    }

    let [missingDefaultsLinkNames] = getMissingLinks(defaultsDocPart.content);

    if (missingDefaultsLinkNames.length > 0) {
      return {
        defaultsDocAvailable: true,
        required: missingDefaultsLinkNames
      };
    }

    let docPart = getPartLocally(docName);

    if (docPart === undefined) {
      return {
        defaultsDocAvailable: true,
        defaultsLinksAvailable: true,
        required: [docName]
      };
    }

    let doc = docPart.content;

    let missingParts = missingContentForEdl(doc);
    let required = missingParts.missingLinkNames
      .concat(missingParts.missingLinkContentPointers)
      .concat(missingParts.missingDocContent);

    return {
      defaultsDocAvailable: true,
      defaultsLinksAvailable: true,
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
    let [missingLinkNames, foundLinks] = getMissingLinks(edl);
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

  function getMissingLinks(doc) {
    let found = [], missing = [];

    // If the type of a link is also a link, it needs to be downloaded too.
    function recurThroughLinkTypes(links, areTypes) {
      if (links.length === 0) { return; }
      let results = links.map(l => [l, getPartLocally(l)]);
      missing = missing.concat(results.filter(l => l[1] === undefined).map(l => l[0]));
      let newFound = results.filter(l => l[1] !== undefined).map(l => l[1].content);
      found = found.concat(newFound);

      // For links that are types, we need to download all the links they contain.
      if (areTypes) {
        newFound.forEach(link => {
          link.forEachPointer(pointer => {
            if (pointer.pointerType === "link") {
              let childResult = getPartLocally(pointer);
              if (childResult) { found.push(childResult); }
              else { missing.push(pointer); }
            }
          });
        });
      }

      recurThroughLinkTypes(newFound.map(link => link.type).filter(type => type?.pointerType === "link"), true);
    }

    recurThroughLinkTypes(doc.links, false);
    return [missing, found];
  }

  return finalObject(obj, {
    getPart,
    getManyParts,
    getPartLocally,
    docStatus
  });
}

export function MockPartRepository(parts) {
  let repo = PartRepository({ getPart: async () => [false] });

  let obj = {
    repo,
    getPartLocally: part => repo.getPartLocally(part),
    addParts: parts => {
      parts.forEach(part => repo.cache.addPart(part));
    },
    getPart: repo.getPart,
    getManyParts: repo.getManyParts,
    docStatus: repo.docStatus
  }

  obj.addParts(parts);
  return obj;
}
