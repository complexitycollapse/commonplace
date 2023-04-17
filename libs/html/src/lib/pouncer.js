import { DocumentModelBuilder, BoxModelBuilder, DocumentModelSerializer, BoxModelSerializer } from '@commonplace/document-model';
import { addProperties } from '@commonplace/utils';

export function Pouncer(repo, docPointer) {
  let obj = {};

  function start() {
    fireNext([]);
  }

  function fireNext(previousResults) {
    // TODO: need something better than this hack to stop the infinite loop
    if (previousResults.find(r => r[0] === undefined)) { return; }

    let status = repo.docStatus(docPointer);
    if (status.allAvailable) {
      let docModel = DocumentModelBuilder(docPointer, repo).build();

      if (obj.docModelJsonCallback) {
        let json = DocumentModelSerializer(docModel).serialize();
        obj.docModelJsonCallback(json);
      }

      if (obj.boxModelCallback || obj.boxModelJsonCallback) {
        let boxModel = BoxModelBuilder(docModel).build();

        if (obj.boxModelJsonCallback) {
          let json = BoxModelSerializer(boxModel).serialize();
          obj.boxModelJsonCallback(json);
        }

        if (obj.boxModelCallback) {
          obj.boxModelCallback(boxModel);
        }
      }

    } else {
      try {
        repo.getManyParts(status.required).then(fireNext);
      } catch (e) {
        console.log(`Failed to download: ${e}`);
      }
     }
  }

  addProperties(obj, { start });
  addProperties(obj, {
    boxModelCallback: undefined,
    docModelJsonCallback: undefined,
    boxModelJsonCallback: undefined
  },
    true);

  return obj;
}
