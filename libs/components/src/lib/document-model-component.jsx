import { Pouncer } from '@commonplace/html';
import { useState, useEffect } from 'react';
import { Part, PartRepository } from '@commonplace/core';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher, defaultsEdl, defaultsLinksParts, defaultsPointer } from '@commonplace/document-model';

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

  return (<div>{JSON.stringify(docJsonState)}</div>);
}
