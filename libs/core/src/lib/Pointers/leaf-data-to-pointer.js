import { leafDataToClip } from "../model";
import { leafDataToEdlPointer } from "./edl-pointer";
import { leafDataToEndPointer } from "./end-pointer";
import { leafDataToInlinePointer } from "./inline-pointer";
import { leafDataToLinkPointer } from "./link-pointer";

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "edl") { return leafDataToEdlPointer(data); }
  else if (type === "end") { return leafDataToEndPointer(data); }
  else if (type === "inline") { return leafDataToInlinePointer(data); }
  else { return leafDataToClip(data); }
}
