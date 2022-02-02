import { Part } from "../part";
import { Pointer } from "./pointer";
import { leafDataToLink } from "../model";

export function LinkPointer(linkName, index) {
  let obj = Pointer(
    "link",
    false,
    x => x.linkName,
    async response => Part(LinkPointer(linkName), leafDataToLink(await response.json())),
    () => `link:${linkName}:${index ?? "N"}`,
    { linkName, index, isTypePointer: false },
    {
      leafData() { return { typ: "link", name: linkName, idx: index }; },
      clipPart(part) { 
        let pointer = part.pointer;
        if (pointer.engulfs(obj)) {
          if (pointer.index === undefined && index !== undefined) {
            return [true, Part(obj, part.content[index])];
          } else {
            return [true, part];
          } 
        } else {
        return false;
        }
      },
      engulfs(other) {
        // If we don't have an index but other does then we may still match as we
        // may represent the array that contains other.

        // We can also potentially engulf an endset pointer, as that is more specific.

        if (other.pointerType === "endset") {
          if (linkName === other.linkName) {
            let indexMatches = index === undefined || index === other.linkIndex;
            return indexMatches;
          }
        }

        if (obj.hasSamePointerType(other) && linkName === other.linkName) {
          let indexMatches = index === undefined || index === other.index;
          return indexMatches;
        }

        return false;
      }
    });

  return obj;
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name, data["idx"]);
}
