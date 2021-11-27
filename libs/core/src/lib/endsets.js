import { leafDataToEdit } from "./edit-lists";
import { addProperties, addMethods } from "./utils";

export function endset(name, set) {
  let obj = {};

  addProperties(obj, { name, set });

  function leafData() {
    if (typeof set === "string") {
      return [name, set];
    } else {
      return [name, ...set.map(e => e.leafData())];
    }
  }

  addMethods(obj, {
    leafData
  });

  return obj;
}

export function leafDataToEndset(leafData) {
  if (leafData.length === 2 && typeof leafData[1] === "string") {
    return endset(leafData[0], leafData[1]);
  } else {
    return endset(leafData[0], leafData.slice(1).map(s => leafDataToEdit(s)));
  }
}
