import { DocumentModelComponent, FlightComponent, BoxModelComponent } from '@commonplace/ui';
import { EdlPointer } from '@commonplace/core';
import { Route, Routes } from 'react-router-dom'
import liveRepository from './live-repository';

let repository = liveRepository();

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

let doc = EdlPointer("testCases.json");
const Flight = () => <FlightComponent docPointers={[doc]} repository={ repository } />;
const DocModel = () => <DocumentModelComponent docPointer={doc} repository={ repository } />
const BoxModel = () => <BoxModelComponent docPointer={doc} repository={ repository } />
