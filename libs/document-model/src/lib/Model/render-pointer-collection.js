import { addProperties, finalObject } from "@commonplace/utils";

export function RenderPointerCollection(ownerPointer, pointerSubjectFn) {
  let obj = {};

  function addDefaults(defaultRenderLinks) {
    defaultRenderLinks.forEach(renderLink => {
      renderLink.forEachPointer((p, e) => {
        if(p.endowsTo(ownerPointer, pointerSubjectFn())) {
          let pointer = renderLink.createRenderPointer(p, e);
          obj.allDefaults.push(pointer);
        }
      });
    });
  }

  function addAllEdlRenderLinks(renderLinks) {
    renderLinks.forEach(renderLink => {
      renderLink.forEachPointer((p, e) =>
        internalTryAdd(p, () => renderLink.createRenderPointer(p, e)));
    });
  }

  function tryAddRenderPointer(renderPointer) {
    return internalTryAdd(renderPointer.pointer, () => renderPointer);
  }

  function internalTryAdd(pointer, renderPointerFn) {
    if (!pointer.endowsTo(ownerPointer, pointerSubjectFn())) {
      return false;
    }

    let renderPointer = renderPointerFn();
    obj.allPointers.push(renderPointer);

    return true;
  }

  function renderPointers() { return obj.allPointers; }

  addProperties(obj, {
    allDefaults: [],
    allPointers: []
  });

  return finalObject(obj, {
    tryAddRenderPointer,
    addAllEdlRenderLinks,
    renderPointers,
    addDefaults
  });
}
