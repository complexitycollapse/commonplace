import { PartCache } from '@commonplace/core';
import { FlightComponent } from '@commonplace/components';
import { StaticPartFetcher } from '@commonplace/html';

let cache = PartCache();
let fetcher = StaticPartFetcher("/assets/content/");

export function App() {
    return (
    <FlightComponent docNames={["testdoc.json"]} cache={cache} fetcher={fetcher}/>
  );
}
export default App;
