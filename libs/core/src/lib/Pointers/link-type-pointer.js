import { Pointer } from "./pointer";

export function LinkTypePointer(linkType) {
  let obj = Pointer("link type", false, () => Promise.resolve(undefined), undefined,
  () => `link type:${linkType}`,
  { linkType, isTypePointer: true, allTypes: linkType === "all" },
  {
    leafData() { return { typ: "link type", name: linkType }; },
    clipPart (part) {
      return obj.engulfs(part.pointer)
        ? [true, part] 
        : [false, undefined];
    },
    engulfs: other => obj.hasSamePointerType(other) && linkType === other.linkType
  });

  return obj;
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}
