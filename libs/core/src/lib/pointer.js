import { addMethods } from "..";
import { addProperties } from "./utils";

export function Pointer(pointerType, isClip, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, methods);
  return obj;
}

export function LinkPointer(linkName) {
  return Pointer("link", false, { linkName }, {
    leafData() { return { typ: "link", name: linkName }; }
  });
}

export function LinkTypePointer(linkType) {
  return Pointer("link type", false, { linkType }, {
    leafData() { return { typ: "link type", name: linkType }; }
  });
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, {});
}
export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name, {});
}

export function DocPointer(docName) {
  return Pointer("doc", false, { docName }, {
    leafData() { return { typ: "doc", name: docName }; }
  });
}

export function leafDataToDocPointer(data) {
  return DocPointer(data.name);
}
