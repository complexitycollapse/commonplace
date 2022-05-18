import { Pointer } from "./pointer";

export function TypePointer(pointerTypeName, metaType, typeItPointsTo) {
  let obj = Pointer(pointerTypeName, false, () => Promise.resolve(undefined), undefined,
  () => `${pointerTypeName}:${typeItPointsTo}`,
  { type: typeItPointsTo, isTypePointer: true, allTypes: typeItPointsTo === "all" },
  {
    leafData() { return { typ: pointerTypeName, name: typeItPointsTo }; },
    clipPart (part) {
      return obj.engulfs(part.pointer)
        ? [true, part] 
        : [false, undefined];
    },
    engulfs: other => obj.hasSamePointerType(other) && typeItPointsTo === other.type,
    overlaps: other => obj.hasSamePointerType(other) && typeItPointsTo === other.type
  });

  return obj;
}

export const ClipTypePointer = type => TypePointer("clip type", "clip", type);
export const EdlTypePointer = type => TypePointer("edl type", "edl", type);
export const LinkTypePointer = type => TypePointer("link type", "link", type);

export function leafDataToClipTypePointer(data) {
  return ClipTypePointer(data.name);
}

export function leafDataToEdlTypePointer(data) {
  return EdlTypePointer(data.name);
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}
