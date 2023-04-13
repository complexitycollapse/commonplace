import { DocumentModelComponent, FlightComponent } from '@commonplace/components';
import { EdlPointer } from '@commonplace/core';
import { Route, Routes } from 'react-router-dom'

export function App() {
  return (
    <Routes>
      <Route path="/" exact Component={Flight} />
      <Route path="/model" exact Component={DocModel} />
    </Routes>

  );
}
export default App;

const Flight = () => <FlightComponent docPointers={[EdlPointer("testdoc.json")]} />;
const DocModel = () => <DocumentModelComponent docPointer={EdlPointer("testdoc.json")} />
