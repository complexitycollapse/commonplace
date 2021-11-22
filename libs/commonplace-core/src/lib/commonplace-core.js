import { mockRepository } from "./mock-repository";
import { addMethods, addProperties } from "./utils";

export function commonplaceCore(repository) {
  let obj = {};
  repository = repository ?? mockRepository();
  addProperties(obj, {
    repository
  });

  function importContent(content) {
    if (!repository.getContent(content)) {
      repository.addContent(content);
    }
    
    return "Name";
  }

  addMethods(obj, {
    importContent
  });

  return obj;
}
