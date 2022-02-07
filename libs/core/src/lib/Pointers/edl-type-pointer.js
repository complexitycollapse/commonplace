import { Pointer } from "./pointer";

export function EdlTypePointer(edlType) {
  let obj = Pointer("edl type", false, () => Promise.resolve(undefined), undefined,
  () => `edl type:${edlType}`,
  { edlType: edlType, isTypePointer: true, allTypes: edlType === "all" },
  {
    leafData() { return { typ: "edl type", name: edlType }; },
    clipPart (part) {
      return obj.engulfs(part.pointer)
        ? [true, part] 
        : [false, undefined];
    },
    engulfs: other => obj.hasSamePointerType(other) && edlType === other.edlType,
    overlaps: other => obj.hasSamePointerType(other) && edlType === other.edlType,
  });

  return obj;
}

export function leafDataToEdlTypePointer(data) {
  return EdlTypePointer(data.name);
}
