import { Pointer } from "./pointer";

export function EdlTypePointer(edlType) {
  let obj = Pointer("edl type", false, () => Promise.resolve(undefined), undefined, { edlType: edlType },
  {
    leafData() { return { typ: "edl type", name: edlType }; },
    clipPart (part) {
      return obj.engulfs(part.pointer)
        ? [true, part] 
        : [false, undefined];
    },
    engulfs: other => obj.hasSamePointerType(other) && edlType === other.edlType
  });

  return obj;
}

export function leafDataToEdlTypePointer(data) {
  return EdlTypePointer(data.name);
}
