import { addProperties } from "./utils";

export function Pointer(pointerType, properties) {
  let obj = {};
  addProperties(obj, { pointerType });
  addProperties(obj, properties);
  return obj;
}

export function LinkPointer(linkName) {
  return Pointer("link", { linkName });
}

export function DocPointer(docName) {
  return Pointer("doc", { docName });
}
