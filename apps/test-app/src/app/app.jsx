import { DocumentModelComponent, FlightComponent, BoxModelComponent } from '@commonplace/ui';
import { EdlPointer } from '@commonplace/core';
import { Route, Routes } from 'react-router-dom'

export function App() {
  return (
    <Routes>
      <Route path="/" exact Component={Flight} />
      <Route path="/model" exact Component={DocModel} />
      <Route path="/box" exact Component={BoxModel} />
    </Routes>

  );
}
export default App;

const Flight = () => <FlightComponent docPointers={[EdlPointer("testdoc.json")]} />;
const DocModel = () => <DocumentModelComponent docPointer={EdlPointer("testdoc.json")} />
const BoxModel = () => <BoxModelComponent docPointer={EdlPointer("testdoc.json")} />
