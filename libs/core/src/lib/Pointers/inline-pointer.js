import { Pointer } from "./pointer";

export function InlinePointer(inlineText) {
  let obj = Pointer(
    "inline",
    true,
    () => undefined,
    undefined,
    () => `inline:${inlineText}}`,
    { inlineText }, 
    {
      leafData() { return { typ: "inline", txt: inlineText }; },
      clipPart: () => false,
      engulfs: () => false,
      overlaps: () => false
    });

    return obj;
}

export function leafDataToInlinePointer(data) {
  return InlinePointer(data.txt);
}
