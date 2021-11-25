import { mockRepository } from "./mock-repository";
import { addMethods, addProperties } from "./utils";
import { doc } from "./docs";

export function commonplaceCore(repository) {
  let obj = {};
  repository = repository ?? mockRepository();
  addProperties(obj, {
    repository
  });

  function ensureContent(content, isPinned) {
    if (!repository.getContent(content)) {
      repository.addContent("Name", content, isPinned);
    }
    
    return "Name";
  }

  function checkName(name, newBlobIdentifier) {
    if (name === undefined) {
      return repository.generateUniqueName();
    }

    let existingBinding = repository.resolveLocalName(name);

    if (existingBinding && existingBinding[2] !== newBlobIdentifier) {
      throw "Name already in use";
    }

    return name;
  }

  function addContentWithLocalName(name, isScroll, content) {
    let blobIdentifier = ensureContent(content, true);
    name = checkName();
    return repository.createLocalName(name, isScroll, blobIdentifier);
  }

  function importContent(name, content) {
    return addContentWithLocalName(name, true, content);
  }

  function newDoc(name, newDoc) {
    let d = newDoc ?? doc([], []);
    return [d, addContentWithLocalName(name, false, d)];
  }

  function updateDoc(name, updatedDoc) {
    let blobIdentifier = ensureContent(updatedDoc, true);
    repository.rebindLocalName(name, blobIdentifier);
  }

  addMethods(obj, {
    importContent,
    newDoc,
    updateDoc
  });

  return obj;
}
