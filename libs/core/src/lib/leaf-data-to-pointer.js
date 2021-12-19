import { leafDataToClip } from "./clip-list";
import { leafDataToLinkPointer, leafDataToDocPointer } from "./pointer";

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "doc") { return leafDataToDocPointer(data); }
  else { return leafDataToClip(data); }
}
