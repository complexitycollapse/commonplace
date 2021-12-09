import { leafDataToEdit } from "./edit-list";
import { addProperties, addMethods } from "./utils";

export function Endset(name, set) {
  let obj = {};

  addProperties(obj, { 
    name,
    set,
    hasEdits: typeof set === "object" && set[0]?.isEdit
  });

  function leafData() {
    let data = name ? { name } : {};
    if (obj.hasEdits) {
      data.ptr = set.map(e => e.leafData());
    } else {
      data.ptr = set;
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
