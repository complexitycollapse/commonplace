import { EdlPointer, PartRepository } from '@commonplace/core';
import { FlightComponent } from '@commonplace/components';
import { StaticPartFetcher } from '@commonplace/html';

let repository = PartRepository(StaticPartFetcher("/assets/content/", fetch));

export function App() {
    return (
    <FlightComponent docPointers={[EdlPointer("testdoc.json")]} repository={repository}/>
  );
}
export default App;
