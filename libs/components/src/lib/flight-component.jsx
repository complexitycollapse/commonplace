import { DocumentComponent } from './document-component';
import { PartRepository } from '@commonplace/core';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher } from '@commonplace/document-model';

let fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

let repository = PartRepository(fetcher);

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
