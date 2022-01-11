import { Part } from "./part";
import { leafDataToEdl } from "./edl";
import { leafDataToLink } from "./link";
import { addProperties, addMethods } from "./utils";

export function Pointer(pointerType, isClip, originMapping, partBuilder, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, { partBuilder });
  addMethods(obj, methods);
  let origin = originMapping(obj);
  addProperties(obj, { origin });
  return obj;
}

export function LinkPointer(linkName, index) {
  return Pointer(
    "link",
    false,
    x => x.linkName,
    async (pointer, response) => Part(LinkPointer(pointer.linkName), leafDataToLink(await response.json())),
    { linkName, index }, {
    leafData() { return { typ: "link", name: linkName, idx: index }; },
    hashableName() { return linkName + "/" + (index === undefined ? "N" : index.toString()); }
  });
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, data["idx"]);
}

export function LinkTypePointer(linkType) {
  return Pointer("link type", false, () => Promise.resolve(undefined), undefined, { linkType }, {
    leafData() { return { typ: "link type", name: linkType }; }
  });
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}

export function EdlPointer(docName) {
  return Pointer(
    "edl",
    false,
    x => x.docName,
    async (pointer, response) => Part(pointer, leafDataToEdl(await response.json())),
    { docName }, {
    leafData() { return { typ: "edl", name: docName }; }
  });
}

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
