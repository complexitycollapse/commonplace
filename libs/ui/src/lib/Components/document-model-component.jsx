import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';
import TreeComponent from './tree-component';
import { convertJsonToNodes } from '../Utilities/convert-json-to-nodes';

export function DocumentModelComponent({ docPointer, repository }) {

  let [docJsonState, setDocJsonState] = useState({});

  function pouncerCallback(json) {
    setDocJsonState(json);
  }

  useEffect(() => {
    let pouncer = Pouncer(repository, docPointer);
    pouncer.docModelJsonCallback = pouncerCallback;
    pouncer.start();
  }, []);

  return (<div style = {{fontFamily: "monospace", fontSize: "1.03em"}}>
    <TreeComponent treeData={convertJsonToNodes(docJsonState, "doc", 0, true).children} />
    </div>);
}
