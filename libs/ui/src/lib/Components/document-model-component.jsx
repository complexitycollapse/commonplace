import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';
import { PartRepository } from '@commonplace/core';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher } from '@commonplace/document-model';
import TreeComponent from './tree-component';
import { convertJsonToNodes } from '../Utilities/convert-json-to-nodes';

export function DocumentModelComponent({ docPointer }) {

  let [docJsonState, setDocJsonState] = useState({});

  const fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

  const repository = PartRepository(fetcher);

  function pouncerCallback(json) {
    setDocJsonState(json);
  }

  useEffect(() => {
    let pouncer = Pouncer(repository, docPointer);
    pouncer.docModelJsonCallback = pouncerCallback;
    pouncer.start();
  }, []);

  return (<div style = {{fontFamily: "monospace", fontSize: "1.03em"}}>
    <TreeComponent treeData={[convertJsonToNodes(docJsonState, "document", 0, true)]} />
    </div>);
}
