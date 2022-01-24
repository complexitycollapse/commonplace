import { Part } from "../part";
import { Pointer } from "./pointer";
import { leafDataToLink } from "../model";

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
