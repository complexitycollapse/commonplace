import { DocumentComponent } from './document-component';

export function FlightComponent({ docPointers, repository }) {
  return (
    <DocumentComponent docPointer={docPointers[0]} repository={repository}></DocumentComponent>
  );
}
