import { Part } from "../part";
import { Pointer } from "./pointer";
import { leafDataToLink } from "../model";
import { LinkPointer } from "./link-pointer";

export function EndPointer(linkName, linkIndex, endName, endIndex) {
  function engulfs(obj, other) {
    // If we don't have an end index but other does then we may still match as we
    // represent all ends with that name.

    if (obj.hasSamePointerType(other)
        && linkName === other.linkName
        && linkIndex === other.linkIndex
        && endName === other.endName) {
      let indexMatches = endIndex === undefined || endIndex === other.endIndex;
      return indexMatches;
    }

    return false;
  }

  let obj = Pointer(
    "end",
    false,
    false,
    x => x.linkName,
    async response => Part(LinkPointer(linkName), leafDataToLink(await response.json())),
    () => `end:${linkName}:${linkIndex ?? "N"}:${endName ?? ""}:${endIndex ?? "N"}`,
    { linkName, linkIndex, endName, endIndex: endIndex, isTypePointer: false },
    {
      leafData() { return { typ: "end", lnk: linkName, lx: linkIndex, end: endName, ex: endIndex }; },
      clipPart(part) { 
        let pointer = part.pointer;
        if (pointer.engulfs(obj)) {
          return LinkPointer(linkName, linkIndex).clipPart(part);
        } else {
        return false;
        }
      },
      engulfs: other => engulfs(obj, other),
      endowsTo: other => engulfs(obj, other)
    });

  return obj;
}

export function leafDataToEndPointer(data) {
  return EndPointer(data.lnk, data["lx"], data["end"], data["ex"]);
}
