import { MockRepository } from "./mock-repository";
import { addMethods, addProperties } from "./utils";
import { Doc } from "./doc";

export function CommonplaceCore(repository) {
  let obj = {};
  repository = repository ?? MockRepository();
  addProperties(obj, {
    repository
  });

  async function ensureContent(content, isPinned) {
    if (!(await repository.getContent(content))) {
      await repository.addContent("Name", content, isPinned);
    }
    
    return "Name";
  }

  async function checkName(name, newBlobIdentifier) {
    if (name === undefined) {
      return await repository.generateUniqueName();
    }

    let existingBinding = await repository.resolveLocalName(name);

    if (existingBinding && existingBinding[2] !== newBlobIdentifier) {
      throw "Name already in use";
    }

    return name;
  }

  async function addContentWithLocalName(name, isScroll, content) {
    let blobIdentifier = await ensureContent(content, true);
    name = await checkName();
    return await repository.createLocalName(name, isScroll, blobIdentifier);
  }

  function importContent(name, content) {
    return addContentWithLocalName(name, true, content);
  }

  async function newDoc(name, newDoc) {
    let d = newDoc ?? Doc([], []);
    return [d, await addContentWithLocalName(name, false, d)];
  }

  async function updateDoc(name, updatedDoc) {
    let blobIdentifier = await ensureContent(updatedDoc, true);
    await repository.rebindLocalName(name, blobIdentifier);
  }

  addMethods(obj, {
    importContent,
    newDoc,
    updateDoc
  });

  return obj;
}
