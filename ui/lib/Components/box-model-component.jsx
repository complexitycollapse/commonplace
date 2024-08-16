import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';
import TreeComponent from './tree-component';
import { convertJsonToNodes } from '../Utilities/convert-json-to-nodes';

export function BoxModelComponent({ docPointer, repository }) {

  let [boxJsonState, setBoxJsonState] = useState({});

  function pouncerCallback(json) {
    setBoxJsonState(json);
  }

  useEffect(() => {
    let pouncer = Pouncer(repository, docPointer);
    pouncer.boxModelJsonCallback = pouncerCallback;
    pouncer.start();
  }, []);

  return (<div style = {{fontFamily: "monospace", fontSize: "1.03em"}}>
    <TreeComponent treeData={convertJsonToNodes(boxJsonState, "root", 0, true).children} />
    </div>);
}
