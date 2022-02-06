import { finalObject } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderPointer } from "./render-pointer";

export function RenderPointerCollection(ownerPointer, ownerTypePointer) {
  let obj = {};
  let directPointers = [], typePointers = [], allTypePointers = [];

  function tryAddAll(renderLinks) {
    renderLinks.forEach(renderLink => {
      renderLink.endsets.forEach(e => {
        e.pointers.forEach(p => {
          internalTryAdd(p, () => RenderPointer(p, RenderEndset(e, renderLink)));
        });
      });
    });
  }

  // This is a hack so that I can inject mock renderPointers. Not a good idea.
  function tryAdd(renderPointer) {
    return internalTryAdd(renderPointer.pointer, () => renderPointer);
  }

  function internalTryAdd(pointer, renderPointerFn) {
    if (pointer.isTypePointer) {
      if (pointer.allTypes) {
        allTypePointers.unshift(renderPointerFn());
        return true
      } else if (ownerTypePointer.engulfs(pointer)) {
        typePointers.unshift(renderPointerFn());
        return true;
      } else {
        return false;
      }
    } else {
      if (ownerPointer.engulfs(pointer)) {
        directPointers.unshift(renderPointerFn());
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
    tryAddAll,
    attributes,
    renderPointers
  });
}
 