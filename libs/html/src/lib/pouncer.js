import { DocumentModelBuilder, BoxModelBuilder } from '@commonplace/document-model';
import { finalObject } from '@commonplace/utils';

export function Pouncer(repo, docPointer, onPartsArrived) {
  function start() {
    fireNext();
  }

  function fireNext() {
    let status = repo.docStatus(docPointer);
    if (status.allAvailable) {
      let docModel = DocumentModelBuilder(docPointer, repo).build();
      let boxModel = BoxModelBuilder(docModel).build();
      onPartsArrived(boxModel);
    } else {
      try {
        // TODO: this is an infinite loop if a part is missing
        repo.getManyParts(status.required).then(fireNext);
      } catch (e) {
        console.log(`Failed to download: ${e}`);
      }
     }
  }

  return finalObject({}, { start });
}
