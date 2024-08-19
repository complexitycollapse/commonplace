import { spanTesting } from "./span.js";
import { imageTesting } from "./image.js";

export function toEqualClip(actualClip, expectedClip) {
  if (actualClip.pointerType !== expectedClip.pointerType) {
    return {
      message: () => `Expected '${JSON.stringify(expectedClip)}', received '${JSON.stringify(actualClip)}'`,
      pass: false
    };
  }

  if (expectedClip.pointerType == "span") {
    return spanTesting.toEqualSpan(actualClip, expectedClip);
  }

  if (expectedClip.pointerType == "image") {
    return imageTesting.toEqualImage(actualClip, expectedClip);
  }

  return {
    message: () => `Clip type '${expectedClip.pointerType}' not understood`,
    pass: false
  };
}
