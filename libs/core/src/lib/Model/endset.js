import { leafDataToPointer } from "../pointers";
import { addProperties, addMethods } from "../utils";

export function Endset(name, pointers) {
  let obj = {};

  if (!Array.isArray(pointers)) {
    throw "Pointers argument to Endset must be an array";
  }

  addProperties(obj, { 
    name,
    pointers
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

export function leafDataToEndset(leafData) {
  let ptr = leafData.ptr;
  let pointers = ptr.map(leafDataToPointer);
  
  return Endset(leafData?.name, pointers);
}
