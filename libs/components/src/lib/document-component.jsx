import { BoxComponent } from './box-component';
import { Box } from '@commonplace/document-model';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, repository }) {

  let [boxTreeState, setBoxTreeState] = useState(Box(undefined, []));

  function pouncerCallback(box) {
    setBoxTreeState(box);
  }

  useEffect(() => {
    Pouncer(repository, docPointer, pouncerCallback).start();
  }, []);

  return (
    <div>
      <BoxComponent box={boxTreeState}/>
    </div>
  );
}
