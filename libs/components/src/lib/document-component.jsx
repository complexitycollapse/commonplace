import { BoxComponent } from './box-component';
import { Box } from '@commonplace/document-model';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ unique, docPointer, repository }) {

  let [boxTreeState, setBoxTreeState] = useState(Box({key: unique}, [], new Map()));

  function pouncerCallback(box) {
    setBoxTreeState(box);
  }

  useEffect(() => {
    let pouncer = Pouncer(repository, docPointer);
    pouncer.boxModelCallback = pouncerCallback;
    pouncer.start();
  }, []);

  return (
    <cpla-doc cpla-key={unique}>
      <BoxComponent key={boxTreeState.key} box={boxTreeState}/>
    </cpla-doc>
  );
}
