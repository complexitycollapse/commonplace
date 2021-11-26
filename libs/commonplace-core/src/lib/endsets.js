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
