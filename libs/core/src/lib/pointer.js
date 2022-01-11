import { leafDataToEdl } from "./edl";
import { leafDataToLink } from "./link";
import { addProperties, addMethods } from "./utils";

export function Pointer(pointerType, isClip, originMapping, contentParser, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, { contentParser });
  addMethods(obj, methods);
  let origin = originMapping(obj);
  addProperties(obj, { origin });
  return obj;
}

export function LinkPointer(linkName, index) {
  return Pointer("link", false, x => x.linkName, leafDataToLink, { linkName, index }, {
    leafData() { return { typ: "link", name: linkName, idx: index }; },
    hashableName() { return linkName + "/" + (index === undefined ? "N" : index.toString()); }
  });
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, data["idx"]);
}

export function LinkTypePointer(linkType) {
  return Pointer("link type", false, () => undefined, undefined, { linkType }, {
    leafData() { return { typ: "link type", name: linkType }; }
  });
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}

export function EdlPointer(docName) {
  return Pointer("edl", false, x => x.docName, leafDataToEdl, { docName }, {
    leafData() { return { typ: "edl", name: docName }; }
  });
}

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
