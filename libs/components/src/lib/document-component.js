import { ZettelRegionComponent } from './zettel-region-component';
import { RenderDocument } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, repository }) {

  let [zettelTreeState, setZettelTreeState] = useState(RenderDocument().zettelTree());

  useEffect(() => {
    async function loadDoc() {
      let doc = (await repository.getPart(docPointer)).content;
      let linkParts = (await repository.getManyParts(doc.links));
      let renderDoc = RenderDocument(doc);
      linkParts.forEach((l, i) => renderDoc.resolveLink(doc.links[i], l.content));
      let tree =  renderDoc.zettelTree();

      let parts = await repository.getManyParts(doc.clips);
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
