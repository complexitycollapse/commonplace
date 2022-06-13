import { leafDataToPointer } from "../pointers";
import { addProperties, addMethods } from "../utils";

export function Endset(name, pointers, index) {
  let obj = {};

  if (!Array.isArray(pointers)) {
    throw "Pointers argument to Endset must be an array";
  }

  if (index != 0 && !index) {
    throw "Missing index argument to Endset";
  }

  addProperties(obj, { 
    name,
    pointers,
    index
  });

  function leafData() {
    let data = name ? { name } : {};
    data.ptr = pointers.map(p => p.leafData());
    return data;
  }

  addMethods(obj, {
    leafData
  });

  return obj;
}

export function leafDataToEndset(leafData, index) {
  let ptr = leafData.ptr;
  let pointers = ptr.map(leafDataToPointer);
  
  return Endset(leafData?.name, pointers, index);
}
