import { DocumentComponent } from './document-component';

export function FlightComponent({ docPointers, repository, defaults }) {
  return (
    <DocumentComponent docPointer={docPointers[0]} repository={repository} defaults={defaults}></DocumentComponent>
  );
}
