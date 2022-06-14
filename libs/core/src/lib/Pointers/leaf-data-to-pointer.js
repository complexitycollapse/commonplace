import { leafDataToClip } from "../model";
import { leafDataToPointerTypePointer } from "./type-pointer";
import { leafDataToEdlPointer } from "./edl-pointer";
import { leafDataToEdlTypePointer } from "./type-pointer";
import { leafDataToEndsetPointer } from "./end-pointer";
import { leafDataToInlinePointer } from "./inline-pointer";
import { leafDataToLinkPointer } from "./link-pointer";
import { leafDataToLinkTypePointer } from './type-pointer';

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "edl") { return leafDataToEdlPointer(data); }
  else if (type === "link type") { return leafDataToLinkTypePointer(data); }
  else if (type === "edl type") { return leafDataToEdlTypePointer(data); }
  else if (type === "end") { return leafDataToEndsetPointer(data); }
  else if (type === "pointer type") { return leafDataToPointerTypePointer(data); }
  else if (type === "inline") { return leafDataToInlinePointer(data); }
  else { return leafDataToClip(data); }
}
