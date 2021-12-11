import { DocumentComponent } from './document-component';

export function FlightComponent({ docNames, cache, fetcher }) {
  return (
    <DocumentComponent docName={docNames[0]} cache={cache} fetcher={fetcher}></DocumentComponent>
  );
}
