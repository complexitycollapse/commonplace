import { Part } from "../part";
import { Pointer } from "./pointer";
import { leafDataToLink } from "../model";
import { LinkPointer } from "./link-pointer";

export function EndsetPointer(linkName, linkIndex, endsetName, endsetIndex) {
  let obj = Pointer(
    "endset",
    false,
    x => x.linkName,
    async response => Part(LinkPointer(linkName), leafDataToLink(await response.json())),
    () => `endset:${linkName}:${linkIndex ?? "N"}:${endsetName ?? ""}:${endsetIndex ?? "N"}`,
    { linkName, linkIndex, endsetName, endsetIndex, isTypePointer: false },
    {
      leafData() { return { typ: "endset", lnk: linkName, lx: linkIndex, es: endsetName, ex: endsetIndex }; },
      clipPart(part) { 
        let pointer = part.pointer;
        if (pointer.engulfs(obj)) {
          return LinkPointer(linkName, linkIndex).clipPart(part);
        } else {
        return false;
        }
      },
      engulfs(other) {
        // If we don't have an endset index but other does then we may still match as we
        // represent all endsets with that name.

        if (obj.hasSamePointerType(other)
            && linkName === other.linkName
            && linkIndex === other.linkIndex
            && endsetName === other.endsetName) {
          let indexMatches = endsetIndex === undefined || endsetIndex === other.endsetIndex;
          return indexMatches;
        }

        return false;
      }
    });

  return obj;
}

export function leafDataToEndsetPointer(data) {
  return EndsetPointer(data.lnk, data["lx"], data["es"], data["ex"]);
}
