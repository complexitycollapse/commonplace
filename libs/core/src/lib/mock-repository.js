import { addMethods } from "./utils";

export function MockRepository() {
  let uniqueKey = 0;

  let obj = {
    content: [],
    docs: [],
    calls: [],
    names: []
  };

  function resolveLocalNameInternal(callback, name) {
    callback(obj.names.find(b => b.name === name));
  }

  function addContent(callback, identifier, content, isPinned) {
    obj.calls.push({ method: "addContent", identifier, content, isPinned });
    obj.content.push({ identifier, content, isPinned });
    callback();
  }

  function getContent(callback, identifier) {
    obj.calls.push({ method: "getContent", identifier });
    obj.content.forEach(c => {
      if (c.identifier === identifier) {
        callback(c.content);
        return;
      }
    });

    callback(undefined);
  }

  function createLocalName(callback, name, scroll, blobIdentifier) {
    obj.calls.push({ method: "createLocalName", name, scroll, blobIdentifier });
    obj.names.push([name, scroll, blobIdentifier]);
    callback(name);
  }

  function rebindLocalName(callback, name, newBlobIdentifier) {
    obj.calls.push({ method: "createLocalName", name, newBlobIdentifier});
    let binding = resolveLocalNameInternal(name);
    if (binding) {
      binding[2] = newBlobIdentifier;
      callback(name);
    } else {
      callback(undefined);
    }
  }

  function unbindLocalName(callback, name) {
    obj.calls.push({ method: "unbindLocalName", name});
    let binding = resolveLocalNameInternal(name);
    let index = obj.names.indexOf(binding);
    if (index >= 0) {
      obj.names.splice(index, 1);
    }
    callback();
  }

  function resolveLocalName(callback, name) {
    obj.calls.push({ method: "resolveLocalName", name});
    callback(resolveLocalNameInternal(name));
  }

  function generateUniqueName(callback) {
    uniqueKey += 1;
    callback("Name" + uniqueKey.toString());
  }

  function clearCalls() {
    obj.calls = [];
    addMethods(obj.calls, {
      forMethod: methodName => obj.calls.filter(c => c.method === methodName)
    })
  }

  addMethods(obj, {
    addContent,
    clearCalls,
    getContent,
    createLocalName,
    rebindLocalName,
    resolveLocalName,
    generateUniqueName,
    unbindLocalName
  });

  clearCalls();
  
  return obj;
}
