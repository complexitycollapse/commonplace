import { finalObject, listMap } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderPointer } from "./render-pointer";

export function RenderPointerCollection(ownerPointer, ownerTypePointer, containingEdl) {
  let obj = {};
  // Each collection is a listMap of RenderPointers keyed by the Edl (hash) they originate from.
  let specificPointers = listMap(), typePointers = listMap(), allTypePointers = listMap();

  function tryAddAll(renderLinks) {
    renderLinks.forEach(renderLink => {
      renderLink.endsets.forEach(e => {
        e.pointers.forEach(p => {
          internalTryAdd(p, () => RenderPointer(p, RenderEndset(e, renderLink)));
        });
      });
    });
  }

  function tryAddRenderPointer(renderPointer) {
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
        push(specificPointers, renderPointerFn());
        return true;
      } else {
        return false;
      }
    } 
  }

  function push(collection, renderPointer) {
    collection.push(renderPointer.renderLink.getHomeEdl().hashableName, renderPointer);
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

    let all = flatten(allTypePointers), type = flatten(typePointers), direct = flatten(specificPointers);
    return all.concat(type, direct);
  }

  function* pointerStack() {
    yield* decomposePointersAccordingToEdlHierarchy(specificPointers);
    yield* decomposePointersAccordingToEdlHierarchy(typePointers);
    yield* decomposePointersAccordingToEdlHierarchy(allTypePointers);
  }

  // Runs through the containingEdl and its ancestors, yielding all RenderPointers that
  // originate in that Edl that are found in the given pointer collection.
  // (So basically we are taking the RenderPointers in the collection and sorting and filtering
  // them according to the Edl hierarchy).
  function* decomposePointersAccordingToEdlHierarchy(renderPointersByEdlHashName) {
    for(let edl = containingEdl; edl !== undefined; edl = edl.parent) {
      let pointers = renderPointersByEdlHashName.get(edl.hashableName);
      if (pointers.length > 0) { yield { edl, pointers: buildPointerList(pointers, edl) }; }
    }
  }

  return finalObject(obj, {
    tryAddRenderPointer,
    tryAddAll,
    renderPointers,
    pointerStack
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
