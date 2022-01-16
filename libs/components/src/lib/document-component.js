import { ZettelRegionComponent } from './zettel-region-component';
import { RenderDocument } from '@commonplace/core';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, repository }) {

  let [zettelTreeState, setZettelTreeState] = useState(RenderDocument().zettelTree());

  useEffect(() => {
    Pouncer(repository).fetchDoc(docPointer).then(tree => setZettelTreeState(tree));
  }, []);

  return (
    <div>
      <ZettelRegionComponent key="froot" segment={zettelTreeState}/>
    </div>
  );
}
