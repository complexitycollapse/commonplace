import { DocumentComponent } from './document-component';

export function FlightComponent({ docs }) {
  return (
    <DocumentComponent doc={docs[0]}></DocumentComponent>
  );
}
