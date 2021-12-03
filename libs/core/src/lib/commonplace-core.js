import { MockRepository } from "./mock-repository";
import { addMethods, addProperties } from "./utils";
import { Doc } from "./doc";

export function CommonplaceCore(repository) {
  let obj = {};
  repository = repository ?? MockRepository();
  addProperties(obj, {
    repository
  });

  function ensureContent(callback, content, isPinned) {
    repository.getContent(repoContent => {
      if (!repoContent) {
        repository.addContent(callback, "Name", content, isPinned);
      } else {
        callback("Name");
      }
    }, content);
  }

  function checkName(callback, name, newBlobIdentifier) {
    if (name === undefined) {
      repository.generateUniqueName(callback);
      return;
    }

    repository.resolveLocalName(existingBinding => {
      if (existingBinding && existingBinding[2] !== newBlobIdentifier) {
        throw "Name already in use";
      }
      callback(name);
    }, name);
  }

  function addContentWithLocalName(callback, name, isScroll, content) {
    let createName = (realNameToUse, blobIdentifier) => {
      repository.createLocalName(callback, realNameToUse, isScroll, blobIdentifier)
    };

    ensureContent(blobIdentifier => {
      if (name) {
        createName(name, blobIdentifier);
      } else {
        checkName(generatedName => createName(generatedName, blobIdentifier));
      }
    }, content, true);
  }

  function importContent(callback, name, content) {
    addContentWithLocalName(callback, name, true, content);
  }

  function newDoc(callback, name, newDoc) {
    let d = newDoc ?? Doc([], []);
    addContentWithLocalName(c => callback([d, c]), name, false, d);
  }

  function updateDoc(callback, name, updatedDoc) {
    ensureContent(blobIdentifier => {
      repository.rebindLocalName(callback, name, blobIdentifier);
    }, updatedDoc, true);
    
  }

  function getContent(callback, name) {
    repository.getContent(callback, name);
  }

  addMethods(obj, {
    importContent,
    newDoc,
    updateDoc,
    getContent
  });

  return obj;
}
