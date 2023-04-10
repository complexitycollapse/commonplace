import { EdlPointer, Part, PartRepository } from '@commonplace/core';
import { FlightComponent } from '@commonplace/components';
import { SequentialPartFetcher, StaticPartFetcher } from '@commonplace/html';
import { DefaultsPartFetcher, defaultsEdl, defaultsPointer } from '@commonplace/document-model';
import { defaultsLinksParts } from '@commonplace/document-model';

let fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

let repository = PartRepository(fetcher);
repository.injectPart(Part(defaultsPointer, defaultsEdl));
defaultsLinksParts.forEach(part => repository.injectPart(part));

export function App() {
    return (
    <FlightComponent docPointers={[EdlPointer("testdoc.json")]} repository={repository}/>
  );
}
export default App;
