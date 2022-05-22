import { Pointer } from "./pointer";

export function TypePointer(pointerTypeName, typeItPointsTo, endowsTo) {
  let obj = Pointer(pointerTypeName, false, () => Promise.resolve(undefined), undefined,
  () => `${pointerTypeName}:${typeItPointsTo}`,
  { type: typeItPointsTo, isTypePointer: true },
  {
    leafData() { return { typ: pointerTypeName, name: typeItPointsTo }; },
    clipPart (part) {
      return obj.engulfs(part.pointer)
        ? [true, part] 
        : [false, undefined];
    },
    engulfs: other => obj.hasSamePointerType(other) && typeItPointsTo === other.type,
    endowsTo
  });

  return obj;
}

export const PointerTypePointer = type => TypePointer("pointer type", type, pointer => pointer.pointerType === type);
export const EdlTypePointer = type => TypePointer("edl type", type, (pointer, subject) => pointer.pointerType === "edl" && subject.type === type);
export const LinkTypePointer = type => TypePointer("link type", type, (pointer, subject) => pointer.pointerType === "link" && subject.type === type);

export function leafDataToPointerTypePointer(data) {
  return PointerTypePointer(data.name);
}

export function leafDataToEdlTypePointer(data) {
  return EdlTypePointer(data.name);
}

export function leafDataToLinkTypePointer(data) {
  return LinkTypePointer(data.name);
}
