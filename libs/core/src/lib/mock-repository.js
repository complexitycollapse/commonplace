import { addMethods } from "./utils";

export function mockRepository() {
  let uniqueKey = 0;

  let obj = {
    content: [],
    docs: [],
    calls: [],
    names: []
  };

  function resolveLocalNameInternal(name) {
    return obj.names.find(b => b.name === name);
  }

  function addContent(identifier, content, isPinned) {
    obj.calls.push({ method: "addContent", identifier, content, isPinned });
    obj.content.push([identifier, content, isPinned]);
  }

  function getContent(identifier) {
    obj.calls.push({ method: "getContent", identifier });
    obj.content.forEach(c => {
      if (c === identifier) return c;
    });

    return undefined;
  }

  function createLocalName(name, scroll, blobIdentifier) {
    obj.calls.push({ method: "createLocalName", name, scroll, blobIdentifier });
    obj.names.push([name, scroll, blobIdentifier]);
    return name;
  }

  function rebindLocalName(name, newBlobIdentifier) {
    obj.calls.push({ method: "createLocalName", name, newBlobIdentifier});
    let binding = resolveLocalNameInternal(name);
    if (binding) {
      binding[2] = newBlobIdentifier;
      return name;
    } else {
      return undefined;
    }
  }

  function unbindLocalName(name) {
    obj.calls.push({ method: "unbindLocalName", name});
    let binding = resolveLocalNameInternal(name);
    let index = obj.names.indexOf(binding);
    if (index >= 0) {
      obj.names.splice(index, 1);
    }
  }

  function resolveLocalName(name) {
    obj.calls.push({ method: "resolveLocalName", name});
    return resolveLocalNameInternal(name);
  }

  function generateUniqueName() {
    uniqueKey += 1;
    return "Name" + uniqueKey.toString();
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