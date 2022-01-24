import { Pointer } from "./pointer";

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
