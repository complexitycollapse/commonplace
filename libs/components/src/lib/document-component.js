import { ZettelRegionComponent } from './zettel-region-component';
import { RenderDocument } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, cache, fetcher }) {

  let [zettelTreeState, setZettelTreeState] = useState(RenderDocument().zettelTree());

  useEffect(() => {
    async function loadDoc() {
      async function loadContent(clip) {
        let cachedClip = cache.getPart(clip);
        if (cachedClip) { return [true, cachedClip]; }

        let part = await fetcher.getPart(clip);
        return [false, part];
      }

      function extractLink(linkPointer, linkObject) {
        return linkPointer.index !== undefined ? linkObject[linkPointer.index] : linkObject;
      }

      async function loadAll(iterable) {
        let results = await Promise.all(iterable.map(item => loadContent(item)));
        results.forEach(r => {
          if (r && !r[0]) { cache.addPart(r[1]); }
        });

        return results.map(r => r[1]);
      }

      let docPart = cache.getPart(docPointer)?.content || await fetcher.getPart(docPointer);
      let doc = docPart.content;
      let rawLinks = (await loadAll(doc.links)).map(p => extractLink(p.pointer, p.content));
      let renderDoc = RenderDocument(doc);
      rawLinks.forEach((l, i) => renderDoc.resolveLink(doc.links[i], l));
      let tree = renderDoc.zettelTree();

      let parts = await loadAll(doc.clips);
      parts.forEach(part => renderDoc.resolvePart(part));

      setZettelTreeState(tree);
    }

    loadDoc();
  }, []);

  return (
    <div>
      <ZettelRegionComponent key="froot" segment={zettelTreeState}/>
    </div>
  );
}

export default Document;
