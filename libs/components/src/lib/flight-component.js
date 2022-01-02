import { DocumentComponent } from './document-component';

export function FlightComponent({ docPointers, cache, fetcher }) {
  return (
    <DocumentComponent docPointer={docPointers[0]} cache={cache} fetcher={fetcher}></DocumentComponent>
  );
}
