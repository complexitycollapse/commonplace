import { Pointer } from "./pointer";

export function EdlTypePointer(edlType) {
  let obj = Pointer("edl type", false, () => Promise.resolve(undefined), undefined, { edlType: edlType }, {
    leafData() { return { typ: "edl type", name: edlType }; },
    clipPart (part) {
      return obj.hasSamePointerType(part.pointer) && edlType === part.pointer.edlType 
        ? [true, part] 
        : [false, undefined];
    }
  });

  return obj;
}

export function leafDataToEdlTypePointer(data) {
  return EdlTypePointer(data.name);
}
