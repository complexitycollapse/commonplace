import { DocumentComponent } from './document-component';
import { Part, PartRepository } from '@commonplace/core';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher, defaultsEdl, defaultsPointer } from '@commonplace/document-model';
import { defaultsLinksParts } from '@commonplace/document-model';

let fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

let repository = PartRepository(fetcher);
repository.injectPart(Part(defaultsPointer, defaultsEdl));
defaultsLinksParts.forEach(part => repository.injectPart(part));

export function FlightComponent({ docPointers }) {
  let uniqueId = "doc:1";
  return (
    <cpla-flight>
      <DocumentComponent
        key={uniqueId}
        unique={uniqueId}
        docPointer={docPointers[0]}
        repository={repository} />
    </cpla-flight>
  );
}
