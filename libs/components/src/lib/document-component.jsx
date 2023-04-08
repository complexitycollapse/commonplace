import { BoxComponent } from './box-component';
import { Box } from '@commonplace/document-model';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ unique, docPointer, repository }) {

  let [boxTreeState, setBoxTreeState] = useState(Box({key: unique}, []));

  function pouncerCallback(box) {
    setBoxTreeState(box);
  }

  useEffect(() => {
    Pouncer(repository, docPointer, pouncerCallback).start();
  }, []);

  return (
    <cpla-doc cpla-key={unique}>
      <BoxComponent key={boxTreeState.key} box={boxTreeState}/>
    </cpla-doc>
  );
}
