import { Part } from "../part";
import { Pointer } from "./pointer";
import { leafDataToLink } from "../model";

export function LinkPointer(linkName) {
  function engulfs(obj, other) {
    // We can engulf an endset pointer, as that is more specific.

    if (other.pointerType === "endset") {
      return linkName === other.linkName;
    }

    return obj.hasSamePointerType(other) && linkName === other.linkName;
  }

  let obj = Pointer(
    "link",
    false,
    x => x.linkName,
    async response => Part(LinkPointer(linkName), leafDataToLink(await response.json())),
    () => `link:${linkName}`,
    { linkName, isTypePointer: false },
    {
      leafData() { return { typ: "link", name: linkName }; },
      clipPart(part) { 
        let pointer = part.pointer;
        if (pointer.engulfs(obj)) {
          return [true, part];
        } else {
        return false;
        }
      },
      engulfs: other => engulfs(obj, other),
      overlaps: other => engulfs(obj, other),
      endowsTo: other => engulfs(obj, other)
    });

  return obj;
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name);
}
