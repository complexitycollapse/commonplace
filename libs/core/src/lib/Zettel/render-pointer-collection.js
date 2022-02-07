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

  function tryAdd(renderPointer) {
    return internalTryAdd(renderPointer.pointer, () => renderPointer);
  }

  function internalTryAdd(pointer, renderPointerFn) {
    if (pointer.isTypePointer) {
      if (pointer.allTypes) {
        allTypePointers.push(renderPointerFn());
        return true
      } else if (ownerTypePointer.engulfs(pointer)) {
        typePointers.push(renderPointerFn());
        return true;
      } else {
        return false;
      }
    } else {
      if (pointer.overlaps(ownerPointer)) {
        directPointers.push(renderPointerFn());
        return true;
      } else {
        return false;
      }
    } 
  }

  function attributes() {
    let result = {};

    function addAllValues(pointers) {
      for(let i = 0; i <= pointers.length - 1; ++i) {
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
 