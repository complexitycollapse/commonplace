import { finalObject } from "../utils";

export function RenderPointerCollection() {
  let obj = {};
  let directPointers = [], typePointers = [];

  function add(pointer) {
    if (pointer.pointer.pointerType === "link") {
      directPointers.unshift(pointer);
    } else if (pointer.pointer.pointerType === "link type") {
      typePointers.unshift(pointer);
    }
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
    add,
    get,
    all
  });
}
 