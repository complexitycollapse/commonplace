import { PartCache, EdlPointer } from '@commonplace/core';
import { FlightComponent } from '@commonplace/components';
import { StaticPartFetcher } from '@commonplace/html';

let cache = PartCache();
let fetcher = StaticPartFetcher("/assets/content/");

export function App() {
    return (
    <FlightComponent docPointers={[EdlPointer("testdoc.json")]} cache={cache} fetcher={fetcher}/>
  );
}
export default App;
