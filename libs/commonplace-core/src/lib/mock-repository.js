import { addMethods } from "./utils";

export function mockRepository() {
  let obj = {
    content: [],
    docs: [],
    calls: []
  };

  function addContent(header) {
    obj.calls.push({ method: "addContent", header: header });
    obj.content.push(header);
  }

  function getContent(identifier) {
    obj.content.forEach(c => {
      if (c === identifier) return c;
    });

    return undefined;
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
    getContent
  });

  clearCalls();
  return obj;
}
