import { ZettelRegionComponent } from './zettel-region-component';
import { DocumentRenderElements } from '@commonplace/html';
import { leafDataToLink, Part, leafDataToEdl, Doc } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, cache, fetcher }) {

  let [fragmentState, setFragmentState] = useState(DocumentRenderElements(Doc(), []).zettelTree());

  useEffect(() => {
    async function loadDoc() {
      async function loadContent(clip, isObject) {
        let content = isObject ? cache.getObject(clip) : extractLink(clip, cache.getPart(clip));
        if (content) {
          return [true, isObject ? content : content];
        } else {
          if (isObject) {
            let obj = await fetcher.getObject(clip);
            let leafData = extractLink(clip, obj);
            let link = leafDataToLink(leafData);
            return [false, link];
          } else {
            return [false, Part(clip, await fetcher.getPart(clip))];
          }
        }
      }

      function extractLink(linkPointer, linkObject) {
        return linkPointer.index !== undefined ? linkObject[linkPointer.index] : linkObject;
      }

      async function loadAll(iterable, areObjects) {
        let results = await Promise.all(iterable.map(item => loadContent(item, areObjects)));
        results.forEach(r => {
          if (!r[0]) { areObjects? cache.addObject(r[1]) : cache.addPart(r[1]); }
        });

        return results.map(r => r[1]);
      }

      let doc = cache.getObject(docPointer) || leafDataToEdl(await fetcher.getObject(docPointer));
      let rawLinks = (await loadAll(doc.links, true));
      let documentElements = DocumentRenderElements(doc, rawLinks);
      let zettel = documentElements.zettel();
      let tree = documentElements.zettelTree();

      let parts = await loadAll(doc.clips, false);

      parts.forEach(part => {
        zettel.forEach(z => {
          if (part.engulfs(z.clip)) { z.content = part.content.substring(z.clip.start, z.clip.next); }
        });
      });

      setFragmentState(tree);
    }

    loadDoc();
  }, []);

  return (
    <div>
      <ZettelRegionComponent key="froot" segment={fragmentState}/>
    </div>
  );
}

export default Document;
