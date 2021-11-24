import { mockRepository } from "./mock-repository";
import { addMethods, addProperties } from "./utils";
import { doc } from "./docs";

export function commonplaceCore(repository) {
  let obj = {};
  repository = repository ?? mockRepository();
  addProperties(obj, {
    repository
  });

  function ensureContent(content) {
    if (!repository.getContent(content)) {
      repository.addContent("Name", content);
    }
    
    return "Name";
  }

  function checkName(name, newBlobIdentifier) {
    if (name === undefined) {
      return repository.generateUniqueName();
    }

    let existingBinding = repository.resolveLocalName(name);

    if (existingBinding && existingBinding !== newBlobIdentifier) {
      throw "Name already in use";
    }

    return name;
  }

  function addContentWithLocalName(name, isScroll, content) {
    let blobIdentifier = ensureContent(content);
    name = checkName();
    return repository.createLocalName(name, isScroll, blobIdentifier);
  }

  function importContent(name, content) {
    return addContentWithLocalName(name, true, content);
  }

  function newDoc(name) {
    return addContentWithLocalName(name, false, doc([], []));
  }

  addMethods(obj, {
    importContent,
    newDoc
  });

  return obj;
}
