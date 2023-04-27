import { LeafCache, defaultsPointer, LocalCache } from '@commonplace/core';
import {
  DocumentModelBuilder, BoxModelBuilder, DocumentModelSerializer, BoxModelSerializer
} from '@commonplace/document-model';
import { addMethods, addProperties } from '@commonplace/utils';

export function Pouncer(repo, docPointer) {
  return PouncerInternal(repo, docPointer, LeafCache());
}

export function TestPouncer(repo, docPointer, testData) {
  let cache = LeafCache();
  testData.forEach(part => cache.addPart(part));
  return PouncerInternal(repo, docPointer, cache);
}

function PouncerInternal(repo, docPointer, cache) {
  let obj = {};

  function start() {
    fireNext([]);
  }

  function fireNext(previousResults) {
    // TODO: need something better than this hack to stop the infinite loop
    if (previousResults.find(r => r[0] === undefined)) { return; }

    previousResults.flat().forEach(part => cache.addPart(part));

    let status = docStatus();
    if (status.allAvailable) {
      let docModel = DocumentModelBuilder(docPointer, LocalCache(cache)).build();

      if (obj.docModelJsonCallback) {
        let json = DocumentModelSerializer(docModel).serialize();
        obj.docModelJsonCallback(json);
      }

      if (obj.boxModelCallback || obj.boxModelJsonCallback) {
        let boxModel = BoxModelBuilder(docModel).build();

        if (obj.boxModelJsonCallback) {
          let json = BoxModelSerializer(boxModel).serialize();
          obj.boxModelJsonCallback(json);
        }

        if (obj.boxModelCallback) {
          obj.boxModelCallback(boxModel);
        }
      }

    } else {
      try {
        repo.getManyParts(status.required).then(fireNext);
      } catch (e) {
        console.log(`Failed to download: ${e}`);
      }
     }
  }

  function getFromCache(pointer) {
    let cached = cache.getPart(pointer);
    if (cached[0]) {
      return cached[1];
     }

     return undefined;
  }

  function docStatus() {
    let defaultsDocPart = getFromCache(defaultsPointer);

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

    let docPart = getFromCache(docPointer);

    if (docPart === undefined) {
      return {
        defaultsDocAvailable: true,
        defaultsLinksAvailable: true,
        required: [docPointer]
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
      .filter(p => p.specifiesContent && !getFromCache(p));

    // Content
    let docContent = edl.clips.map(c => [c, getFromCache(c)]);
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
      let results = links.map(l => [l, getFromCache(l)]);
      missing = missing.concat(results.filter(l => l[1] === undefined).map(l => l[0]));
      let newFound = results.filter(l => l[1] !== undefined).map(l => l[1].content);

      // For links that are types, we need to download all the links they contain,
      // and their types.
      if (areTypes) {
        [...newFound].forEach(link => {
          link.forEachPointer(pointer => {
            if (pointer.pointerType === "link") {
              let childResult = getFromCache(pointer);
              if (childResult) { newFound.push(childResult); }
              else { missing.push(pointer); }
            }
          });
        });
      }

      found = found.concat(newFound);

      let typesToResolve = newFound.map(link => link.type).filter(type => type?.pointerType === "link");
      recurThroughLinkTypes(typesToResolve, true);
    }

    recurThroughLinkTypes(doc.links, false);
    return [missing, found];
  }

  addMethods(obj, { start, docStatus });
  addProperties(obj, {
    boxModelCallback: undefined,
    docModelJsonCallback: undefined,
    boxModelJsonCallback: undefined
  },
    true);

  return obj;
}
