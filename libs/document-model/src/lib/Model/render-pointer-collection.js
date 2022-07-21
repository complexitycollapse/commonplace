import { addProperties, finalObject, listMap } from "@commonplace/utils";
import { AttributesSourceFromPointers } from "../Attributes/attributes-source";

export function RenderPointerCollection(ownerPointer, pointerSubjectFn, containingEdl) {
  let obj = {};
  // Each collection is a listMap of RenderPointers keyed by the Edl (hash) they originate from.
  let pointers = listMap(), defaultsStack = [];

  function addDefaults(defaultRenderLinks) {
    let relevantPointers = [];
    defaultRenderLinks.forEach(renderLink => {
      renderLink.forEachPointer((p, e) => {
        if(p.endowsTo(ownerPointer, pointerSubjectFn())) {
          let pointer = renderLink.createRenderPointer(p, e);
          relevantPointers.push(pointer);
          obj.allDefaults.push(pointer);
        }
      });
    });

    defaultsStack = [AttributesSourceFromPointers("defaults", relevantPointers.reverse())];
  }

  function allAllEdlRenderLinks(renderLinks) {
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
    pointers.push(renderPointer.renderLink.getHomeEdl().hashableName, renderPointer);
    obj.allPointers.push(renderPointer);

    return true;
  }

  function renderPointers() {
    return [...pointers.values()].flat();
  }

  function pointerStack() {
    return [...pointerStackIterator()];
  }

  function* pointerStackIterator() {
    yield* decomposePointersAccordingToEdlHierarchy(pointers);
  }

  // Runs through the containingEdl and its ancestors, yielding all RenderPointers that
  // originate in that Edl that are found in the given pointer collection.
  // (So basically we are taking the RenderPointers in the collection and sorting and filtering
  // them according to the Edl hierarchy).
  function* decomposePointersAccordingToEdlHierarchy(renderPointersByEdlHashName) {
    for(let edl = containingEdl; edl !== undefined; edl = edl.parent) {
      let pointers = renderPointersByEdlHashName.get(edl.hashableName);
      if (pointers.length > 0) { yield AttributesSourceFromPointers(edl, buildPointerList(pointers, edl)); }
    }
  }

  addProperties(obj, {
    allDefaults: [],
    allPointers: []
  });

  return finalObject(obj, {
    tryAddRenderPointer,
    allAllEdlRenderLinks,
    renderPointers,
    pointerStack,
    addDefaults,
    defaultsStack: () => defaultsStack
  });
}

function buildPointerList(pointers, edl) {
  let sortedList = [];
  edl.edl.links.forEach(pointer => {
    let rp = pointers.find(p => p.renderLink.pointer == pointer);
    if (rp) { sortedList.push(rp); }
  });
  return sortedList.reverse();
}
