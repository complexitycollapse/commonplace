import { EdlComponent } from './edl-component';
import { EdlZettel, emptyDocPointer } from '@commonplace/core';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, repository, defaults }) {

  let [zettelTreeState, setZettelTreeState] = useState(EdlZettel(emptyDocPointer, undefined, defaults, "1"));

  useEffect(() => {
    Pouncer(repository).fetchDoc(docPointer, defaults).then(tree => setZettelTreeState(tree));
  }, []);

  return (
    <div>
      <EdlComponent key={zettelTreeState.key} edl={zettelTreeState}/>
    </div>
  );
}
