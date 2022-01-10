import { ZettelRegionComponent } from './zettel-region-component';
import { RenderDocument } from '@commonplace/html';
import { leafDataToLink, Part, leafDataToEdl, Doc, Span, Box } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, cache, fetcher }) {

  let [zettelTreeState, setZettelTreeState] = useState(RenderDocument(Doc()).zettelTree());

  useEffect(() => {
    async function loadDoc() {
      async function loadContent(clip, isObject) {
        let cachedClip = cache.getPart(clip);
        if (cachedClip) { return [true, cachedClip]; }

        let content = undefined;

        let obj = await fetcher.getPart(clip);
        if (!obj) { return undefined; }
        if (isObject) {
          content = leafDataToLink(obj);
        } else {
          content = obj;
          clip = clip.clipType === "span" ?
            Span(clip.origin, 0, content.length) :
            Box(clip.origin, 0, 0, 10000, 10000);
        }

        return [false, Part(clip, content)];
      }

      function extractLink(linkPointer, linkObject) {
        return linkPointer.index !== undefined ? linkObject[linkPointer.index] : linkObject;
      }

      async function loadAll(iterable, areObjects) {
        let results = await Promise.all(iterable.map(item => loadContent(item, areObjects)));
        results.forEach(r => {
          if (r && !r[0]) { cache.addPart(r[1]); }
        });

        return results.map(r => r[1]);
      }

      let doc = cache.getPart(docPointer)?.content || leafDataToEdl(await fetcher.getPart(docPointer));
      let rawLinks = (await loadAll(doc.links, true)).map(p => extractLink(p.pointer, p.content));
      let renderDoc = RenderDocument(doc);
      rawLinks.forEach((l, i) => renderDoc.resolveLink(doc.links[i], l));
      let tree = renderDoc.zettelTree();

      let parts = await loadAll(doc.clips, false);
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
