import { finalObject } from "../utils";

export function RenderPointerCollection(ownerPointer, ownerTypePointer) {
  let obj = {};
  let directPointers = [], typePointers = [];
  let directPointerType = ownerPointer.pointerType;
  let typePointerType = directPointerType === "link" ? "link type" : "edl type";

  function tryAdd(renderPointer) {
    let pointer = renderPointer.pointer;

    if (pointer.pointerType === directPointerType) {
      if (ownerPointer.engulfs(pointer)) {
        directPointers.unshift(renderPointer);
        return true;
      } else {
        return false;
      }
    } else if (pointer.pointerType === typePointerType) {
      if (ownerTypePointer.engulfs(pointer)) {
        typePointers.unshift(renderPointer);
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  function get(attributeName) {
    let pointer = directPointers.find(p => p.getAttributeEndowment(attributeName));
    if (pointer) { return pointer.getAttributeEndowment(attributeName); }

    pointer = typePointers.find(p => p.getAttributeEndowment(attributeName));
    if (pointer) { return pointer.getAttributeEndowment(attributeName); }

    return undefined;
  }

  function all() {
    let result = {};

    function addAllValues(pointers) {
      for(let i = pointers.length - 1; i >= 0; --i) {
        Object.entries(pointers[i].getAllAttributeEndowments()).forEach( kv => {
          result[kv[0]] = kv[1];
        });
      };
    }

    addAllValues(typePointers);
    addAllValues(directPointers);

    return result;
  }

  return finalObject(obj, {
    tryAdd,
    get,
    all
  });
}
 