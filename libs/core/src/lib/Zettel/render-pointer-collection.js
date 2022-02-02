import { finalObject } from "../utils";

export function RenderPointerCollection(ownerPointer, ownerTypePointer) {
  let obj = {};
  let directPointers = [], typePointers = [], allTypePointers = [];

  function tryAdd(renderPointer) {
    let pointer = renderPointer.pointer;
    
    if (pointer.isTypePointer) {
      if (pointer.allTypes) {
        allTypePointers.unshift(renderPointer);
        return true
      } else if (ownerTypePointer.engulfs(pointer)) {
        typePointers.unshift(renderPointer);
        return true;
      } else {
        return false;
      }
    } else {
      if (ownerPointer.engulfs(pointer)) {
        directPointers.unshift(renderPointer);
        return true;
      } else {
        return false;
      }
    } 
  }

  function attributes() {
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

  function renderPointers() {
    return typePointers.concat(directPointers);
  }

  return finalObject(obj, {
    tryAdd,
    attributes,
    renderPointers
  });
}
 