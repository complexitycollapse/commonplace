import { addMethods } from "@commonplace/utils";

export function MockRepository() {
  let uniqueKey = 0;

  let obj = {
    content: [],
    docs: [],
    calls: [],
    names: []
  };

  function resolveLocalNameInternal(name) {
    return new Promise(res => 
      res(obj.names.find(b => b.name === name)));
  }

  function addContent(identifier, content, isPinned) {
    obj.calls.push({ method: "addContent", identifier, content, isPinned });
    return new Promise(res => 
      res(obj.content.push({ identifier, content, isPinned })));
  }

  function getContent(identifier) {
    obj.calls.push({ method: "getContent", identifier });
    return new Promise(res => {
      obj.content.forEach(c => {
        if (c.identifier === identifier) {
          res(c.content);
          return;
        }
      });
      res(undefined);
    });
  }

  function createLocalName(name, scroll, blobIdentifier) {
    obj.calls.push({ method: "createLocalName", name, scroll, blobIdentifier });
    return new Promise(res => {
      obj.names.push([name, scroll, blobIdentifier]);
      res(name);
    });
  }

  async function rebindLocalName(name, newBlobIdentifier) {
    obj.calls.push({ method: "createLocalName", name, newBlobIdentifier});
    let binding = await resolveLocalNameInternal(name);
    if (binding) {
      binding[2] = newBlobIdentifier;
      return name;
    } else {
      return undefined;
    }
  }

  async function unbindLocalName(name) {
    obj.calls.push({ method: "unbindLocalName", name});
    let binding = await resolveLocalNameInternal(name);
    let index = obj.names.indexOf(binding);
    if (index >= 0) {
      obj.names.splice(index, 1);
    }
  }

  async function resolveLocalName(name) {
    obj.calls.push({ method: "resolveLocalName", name});
    let binding = await resolveLocalNameInternal(name);
    return binding[2];
  }

  async function generateUniqueName() {
    obj.calls.push({ method: "generateUniqueName"});
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
