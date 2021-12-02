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
    if (obj.hasEdits) {
      return [name, ...set.map(e => e.leafData())];
    } else {
      return [name, set];
    }
  }

  addMethods(obj, {
    leafData
  });

  return obj;
}

export function leafDataToEndset(leafData) {
  if (leafData.length === 2 && typeof leafData[1] === "string") {
    return Endset(leafData[0], leafData[1]);
  } else {
    return Endset(leafData[0], leafData.slice(1).map(s => leafDataToEdit(s)));
  }
}
