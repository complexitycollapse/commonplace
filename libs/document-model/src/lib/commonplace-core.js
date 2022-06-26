import { MockRepository } from "./mock-repository";
import { finalObject, addProperties } from "@commonplace/utils";

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

  async function addContentWithLocalName(name, content) {
    let blobIdentifier = await ensureContent(content, true);
    name = await checkName();
    return await repository.createLocalName(name, true, blobIdentifier);
  }

  function addContent(content) {
    return ensureContent(content, true);
  }

  function getContent(callback, name) {
    // TODO: should be doing a local name resolution if necessary
    repository.getContent(callback, name);
  }

  function rebindLocalName(name, blobIdentifier) {
    repository.rebindLocalName(name, blobIdentifier);
  }

  return finalObject(obj, {
    addContent,
    addContentWithLocalName,
    getContent,
    rebindLocalName
  });
}
