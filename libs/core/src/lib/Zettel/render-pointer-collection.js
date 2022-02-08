import { finalObject, listMap } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderPointer } from "./render-pointer";

export function RenderPointerCollection(ownerPointer, ownerTypePointer) {
  let obj = {};
  let directPointers = listMap(), typePointers = listMap(), allTypePointers = listMap();

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
        push(allTypePointers, renderPointerFn());
        return true
      } else if (ownerTypePointer.engulfs(pointer)) {
        push(typePointers, renderPointerFn());
        return true;
      } else {
        return false;
      }
    } else {
      if (pointer.overlaps(ownerPointer)) {
        push(directPointers, renderPointerFn());
        return true;
      } else {
        return false;
      }
    } 
  }

  function push(collection, renderPointer) {
    collection.push(renderPointer.renderLink.getHomeEdl(), renderPointer);
  }

  function allPointers() {
    return [directPointers, typePointers, allTypePointers];
  }

  // function attributes() {
  //   let result = {};

  //   function addAllValues(pointers) {
  //     for(let i = 0; i <= pointers.length - 1; ++i) {
  //       Object.entries(pointers[i].getAllAttributeEndowments()).forEach( kv => {
  //         result[kv[0]] = kv[1];
  //       });
  //     };
  //   }

    // addAllValues(typePointers);
    // addAllValues(directPointers);

    // return result;
  // }

  function renderPointers() {
    function flatten(map) {
      return [...map.values()].flat();
    }

    let all = flatten(allTypePointers), type = flatten(typePointers), direct = flatten(directPointers);
    return all.concat(type, direct);
  }

  return finalObject(obj, {
    tryAdd,
    tryAddAll,
    allPointers,
    renderPointers
  });
}

