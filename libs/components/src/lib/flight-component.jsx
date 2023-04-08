import { DocumentComponent } from './document-component';

export function FlightComponent({ docPointers, repository }) {
  let uniqueId = "doc:1";
  return (
    <cpla-flight>
      <DocumentComponent
        key={uniqueId}
        unique={uniqueId}
        docPointer={docPointers[0]}
        repository={repository} />
    </cpla-flight>
  );
}
