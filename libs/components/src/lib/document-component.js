import { EdlComponent } from './zettel-region-component';
import { EdlZettel, emptyDocPointer } from '@commonplace/core';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, repository }) {

  let [zettelTreeState, setZettelTreeState] = useState(EdlZettel(emptyDocPointer, undefined, "1"));

  useEffect(() => {
    Pouncer(repository).fetchDoc(docPointer).then(tree => setZettelTreeState(tree));
  }, []);

  return (
    <div>
      <EdlComponent key={zettelTreeState.key} edl={zettelTreeState}/>
    </div>
  );
}
