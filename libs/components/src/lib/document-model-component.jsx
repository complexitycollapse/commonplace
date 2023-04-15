import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';
import { Part, PartRepository } from '@commonplace/core';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher, defaultsEdl, defaultsLinksParts, defaultsPointer } from '@commonplace/document-model';
import TreeComponent from './tree-component';

export function DocumentModelComponent({ docPointer }) {

  let [docJsonState, setDocJsonState] = useState({});

  const fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

  const repository = PartRepository(fetcher);
  repository.injectPart(Part(defaultsPointer, defaultsEdl));
  defaultsLinksParts.forEach(part => repository.injectPart(part));

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

function convertJsonToNodes(json, label, key, expanded) {
  if (Array.isArray(json)) {
    return {
      key,
      label: label + " ",
      value: "[" + json.length + "]",
      children: json.map((x, i) => convertJsonToNodes(x, i.toString(), i)),
      expanded
    };
  } else if (typeof json === "object") {
    return {
      key,
      label,
      children: Object.entries(json).map(([key, value], i) => convertJsonToNodes(value, key, i)),
      expanded
    };
  } else {
    return {
      key,
      label: label + " : ",
      value: JSON.stringify(json),
      expanded
    };
  }
}
