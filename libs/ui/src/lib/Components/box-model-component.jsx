import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';
import { PartRepository } from '@commonplace/core';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher } from '@commonplace/document-model';
import TreeComponent from './tree-component';
import { convertJsonToNodes } from '../Utilities/convert-json-to-nodes';

export function BoxModelComponent({ docPointer }) {

  let [boxJsonState, setBoxJsonState] = useState({});

  let fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

  let repository = PartRepository(fetcher);

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
