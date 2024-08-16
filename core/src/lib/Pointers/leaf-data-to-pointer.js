import { leafDataToClip } from "../model.js";
import { leafDataToEdlPointer } from "./edl-pointer.js";
import { leafDataToInlinePointer } from "./inline-pointer.js";
import { leafDataToLinkPointer } from "./link-pointer.js";

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "edl") { return leafDataToEdlPointer(data); }
  else if (type === "inline") { return leafDataToInlinePointer(data); }
  else { return leafDataToClip(data); }
}
