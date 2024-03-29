import { Part } from "../part";
import { Pointer } from "./pointer";
import { leafDataToLink } from "../model";
import jsonParse from "../json-parse";

export function LinkPointer(linkName) {
  function engulfs(obj, other) {
    return obj.sameType(other) && linkName === other.linkName;
  }

  let obj = Pointer(
    "link",
    false,
    false,
    x => x.linkName,
    async (response, origin) => Part(LinkPointer(linkName), leafDataToLink(await jsonParse(response, origin))),
    () => `link:${linkName}`,
    { linkName },
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
      endowsTo: other => engulfs(obj, other),
      nibble: other => ({ nibbled: engulfs(obj, other), remainder: undefined })
    });

  return obj;
}

export function leafDataToLinkPointer(data) {
  return LinkPointer(data.name);
}
