import { Part } from "../part";
import { leafDataToEdl, leafDataToLink } from "../model";
import { addProperties, addMethods } from "../utils";

export function Pointer(pointerType, isClip, originMapping, partBuilder, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, { 
    partBuilder,
    hasSamePointerType: pointer => pointer.pointerType === pointerType
  });
  addMethods(obj, methods);
  let origin = originMapping(obj);
  addProperties(obj, { origin });
  return obj;
}

export function LinkPointer(linkName, index) {
  let obj = Pointer(
    "link",
    false,
    x => x.linkName,
    async response => Part(LinkPointer(linkName), leafDataToLink(await response.json())),
    { linkName, index }, {
    leafData() { return { typ: "link", name: linkName, idx: index }; },
    hashableName() { return linkName + "/" + (index === undefined ? "N" : index.toString()); },
    clipPart(part) { 
      let pointer = part.pointer;
      if (!obj.hasSamePointerType(pointer) || pointer.linkName !== linkName) {
        return [false, undefined];
      } else if (index === undefined) {
        return pointer.index === undefined ? [true, part] : [false, undefined];
      } else if (pointer.index === index) {
        return [true, part];
      } else if (pointer.index === undefined) {
        return [true, Part(obj, part.content[index])];
      } else {
        return [false, undefined];
      }
    }
  });

  return obj;
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, data["idx"]);
}

export function LinkTypePointer(linkType) {
  let obj = Pointer("link type", false, () => Promise.resolve(undefined), undefined, { linkType }, {
    leafData() { return { typ: "link type", name: linkType }; },
    clipPart (part){
      return obj.hasSamePointerType(part.pointer) && linkType === part.pointer.linkType 
        ? [true, part] 
        : [false, undefined];
    }
  });

  return obj;
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}

export function EdlPointer(docName) {
  let obj = Pointer(
    "edl",
    false,
    x => x.docName,
    async response => Part(obj, leafDataToEdl(await response.json())),
    { docName }, {
    leafData() { return { typ: "edl", name: docName }; },
    clipPart (part){
      return obj.hasSamePointerType(part.pointer) && docName === part.pointer.docName 
        ? [true, part] 
        : [false, undefined];
    }
  });

  return obj;
}

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
