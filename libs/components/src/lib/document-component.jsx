import { BoxComponent } from './box-component';
import { Box } from '@commonplace/document-model';
import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docPointer, repository }) {

  let [boxTreeState, setBoxTreeState] = useState(Box(undefined, []));

  useEffect(() => {
    Pouncer(repository, docPointer, setBoxTreeState).start();
  }, []);

  return (
    <div>
      <BoxComponent box={boxTreeState}/>
    </div>
  );
}
