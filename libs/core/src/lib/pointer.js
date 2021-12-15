import { addMethods } from "..";
import { addProperties } from "./utils";

export function Pointer(pointerType, isEdit, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isEdit });
  addProperties(obj, properties);
  addMethods(obj, methods);
  return obj;
}

export function LinkPointer(linkName) {
  return Pointer("link", false, { linkName }, {
    leafData() { return { typ: "link", name: linkName }; }
  });
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, {});
}

export function DocPointer(docName) {
  return Pointer("doc", false, { docName }, {
    leafData() { return { typ: "doc", name: docName }; }
  });
}

export function leafDataToDocPointer(data) {
  return DocPointer(data.name);
}
