import { Pointer } from "./pointer.js";

export function InlinePointer(inlineText) {
  let obj = Pointer(
    "inline",
    false,
    true,
    () => undefined,
    undefined,
    () => `inline:${inlineText}`,
    { inlineText }, 
    {
      leafData() { return { typ: "inline", txt: inlineText }; },
      clipPart: () => false,
      engulfs: () => false,
      endowsTo: () => false
    });

    return obj;
}

export function leafDataToInlinePointer(data) {
  return InlinePointer(data.txt);
}
