import { DocumentModelBuilder, BoxModelBuilder } from '@commonplace/document-model';
import { finalObject } from '@commonplace/utils';

export function Pouncer(repo, docPointer, onPartsArrived) {
  function start() {
    fireNext([]);
  }

  function fireNext(previousResults) {
    // TODO: need something better than this hack to stop the infinite loop
    if (previousResults.find(r => r[0] === undefined)) { return; }

    let status = repo.docStatus(docPointer);
    if (status.allAvailable) {
      let docModel = DocumentModelBuilder(docPointer, repo).build();
      let boxModel = BoxModelBuilder(docModel).build();
      onPartsArrived(boxModel);
    } else {
      try {
        repo.getManyParts(status.required).then(fireNext);
      } catch (e) {
        console.log(`Failed to download: ${e}`);
      }
     }
  }

  return finalObject({}, { start });
}
