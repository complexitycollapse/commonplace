import { leafDataToDoc } from '@commonplace/core';
import { FlightComponent } from '@commonplace/components';

const leaf = {
  edl: [
    {typ: "span", ori: "origin", st: 0, ln: 10},
    {typ: "span", ori: "origin", st: 100, ln: 1000},
    {typ: "span", ori: "origin", st: 2100, ln: 50}
  ],
  odl: []
};

let doc = leafDataToDoc(leaf);

export function App() {
  return (
    <FlightComponent docs={[doc]}/>
  );
}
export default App;
