import { Pointer } from "./pointer";

export function ClipTypePointer(clipType) {
  let obj = Pointer("clip type", false, () => Promise.resolve(undefined), undefined,
  () => `clip type:${clipType}`,
  { clipType },
  {
    leafData() { return { typ: "clip type", name: clipType }; },
    clipPart (part) {
      return obj.engulfs(part.pointer)
        ? [true, part] 
        : [false, undefined];
    },
    engulfs: other => obj.hasSamePointerType(other) && clipType === other.clipType
  });

  return obj;
}

export function leafDataToClipTypePointer(data) {
  return ClipTypePointer(data.name);
}
