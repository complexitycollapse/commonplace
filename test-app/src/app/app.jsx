import { DocumentModelComponent, FlightComponent, BoxModelComponent } from '@commonplace/ui';
import { EdlPointer } from '@commonplace/core';
import { Route, Routes, useParams } from 'react-router-dom'
import liveRepository from './live-repository';

let repository = liveRepository();

export function App() {

  return (
    <Routes>
      <Route path="/:docName" exact Component={Flight} />
      <Route path="/:docName/model" exact Component={DocModel} />
      <Route path="/:docName/box" exact Component={BoxModel} />
    </Routes>

  );
}
export default App;

const Flight = () => {
  let { docName } = useParams();

  return (<FlightComponent docPointers={[EdlPointer(docName + "/doc.json")]} repository={repository} />);
}

const DocModel = () => {
  let { docName } = useParams();

  return (<DocumentModelComponent docPointer={EdlPointer(docName + "/doc.json")} repository={repository} />);
}

const BoxModel = () => {
  let { docName } = useParams();

  return (<BoxModelComponent docPointer={EdlPointer(docName + "/doc.json")} repository={repository} />);
}
