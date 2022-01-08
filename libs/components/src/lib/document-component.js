import { ZettelRegionComponent } from './zettel-region-component';
import { RenderDocument } from '@commonplace/html';
import { leafDataToLink, Part, leafDataToEdl, Doc, Span, Box } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, cache, fetcher }) {

  let [zettelTreeState, setZettelTreeState] = useState(RenderDocument(Doc()).zettelTree());

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
            let content = await fetcher.getPart(clip);
            let newClip = clip.clipType === "span" ?
              Span(clip.origin, 0, content.length) :
              Box(clip.origin, 0, 0, 10000, 10000);
            return [false, Part(newClip, content)];
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
