import { ZettelSegment } from './zettel-segment';
import { DocumentRenderElements } from '@commonplace/html';
import { leafDataToLink, Part, leafDataToDoc, Doc } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docName, cache, fetcher }) {

  let [fragmentState, setFragmentState] = useState(DocumentRenderElements(Doc(), []).zettelTree());

  useEffect(() => {
    async function loadDoc() {
      async function loadContent(clip, isObject) {
        let content = isObject ? cache.getObject(clip) : cache.getPart(clip);
        if (content) {
          return [true, isObject ? content : content];
        } else {
        return isObject ? [false, leafDataToLink(await fetcher.getObject(clip))] : [false, Part(clip, await fetcher.getPart(clip))];
        }
      }

      async function loadAll(iterable, areObjects) {
        let results = await Promise.all(iterable.map(item => loadContent(item, areObjects)));
        results.forEach(r => {
          if (!r[0]) { areObjects? cache.addObject(r[1]) : cache.addPart(r[1]); }
        });

        return results.map(r => r[1]);
      }

      let doc = cache.getObject(docName) || leafDataToDoc(await fetcher.getObject(docName));
      let rawLinks = (await loadAll(doc.overlay, true));
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
      <ZettelSegment key="froot" segment={fragmentState}/>
    </div>
  );
}

export default Document;
