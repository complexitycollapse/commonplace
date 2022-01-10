import { addMethods } from "..";
import { addProperties } from "./utils";

export function Pointer(pointerType, isClip, nameMapping, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, methods);
  let origin = nameMapping(obj);
  addProperties(obj, { origin });
  return obj;
}

export function LinkPointer(linkName, index) {
  return Pointer("link", false, x => x.linkName, { linkName, index }, {
    leafData() { return { typ: "link", name: linkName, idx: index }; },
    hashableName() { return linkName + "/" + (index === undefined ? "N" : index.toString()); }
  });
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, data["idx"]);
}

export function LinkTypePointer(linkType) {
  return Pointer("link type", false, () => undefined, { linkType }, {
    leafData() { return { typ: "link type", name: linkType }; }
  });
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}

export function EdlPointer(docName) {
  return Pointer("edl", false, x => x.docName, { docName }, {
    leafData() { return { typ: "edl", name: docName }; }
  });
}

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
