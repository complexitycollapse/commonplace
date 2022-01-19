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

  return finalObject(obj, {
    add,
    get
  });
}
