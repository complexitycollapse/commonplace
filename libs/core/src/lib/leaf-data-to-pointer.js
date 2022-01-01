import { leafDataToClip } from "./edl";
import { leafDataToLinkPointer, leafDataToLinkTypePointer, leafDataToEdlPointer } from "./pointer";

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "edl") { return leafDataToEdlPointer(data); }
  else if (type === "link type") { return leafDataToLinkTypePointer(data); }
  else { return leafDataToClip(data); }
}
