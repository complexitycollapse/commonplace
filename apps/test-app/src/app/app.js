import { EdlPointer } from '@commonplace/core';
import { DefaultsDocModel } from '@commonplace/document-model';
import { FlightComponent } from '@commonplace/components';
import { StaticPartFetcher, PartRepository } from '@commonplace/html';

let repository = PartRepository(StaticPartFetcher("/assets/content/", fetch));
let defaults = DefaultsDocModel();

export function App() {
    return (
    <FlightComponent docPointers={[EdlPointer("testdoc.json")]} repository={repository} defaults = {defaults}/>
  );
}
export default App;
