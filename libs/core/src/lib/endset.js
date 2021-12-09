import { leafDataToEdit } from "./edit-list";
import { addProperties, addMethods } from "./utils";

export function Endset(name, pointer) {
  let obj = {};

  addProperties(obj, { 
    name,
    pointer,
    hasEdits: typeof pointer === "object" && pointer[0]?.isEdit
  });

  function leafData() {
    let data = name ? { name } : {};
    if (obj.hasEdits) {
      data.ptr = pointer.map(e => e.leafData());
    } else {
      data.ptr = pointer;
    }
    return data;
  }

  addMethods(obj, {
    leafData
  });

  return obj;
}

export function leafDataToEndset(leafData) {
  let ptr = leafData.ptr;
  let pointer = typeof ptr === "string" ? ptr : ptr.map(leafDataToEdit);
  
  return Endset(leafData?.name, pointer);
}
