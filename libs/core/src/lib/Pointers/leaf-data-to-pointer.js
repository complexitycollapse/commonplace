import { leafDataToClip } from "../model";
import { leafDataToEdlPointer } from "./edl-pointer";
import { leafDataToEdlTypePointer } from "./edl-type-pointer";
import { leafDataToLinkPointer } from "./link-pointer";
import { leafDataToLinkTypePointer } from './link-type-pointer';

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "edl") { return leafDataToEdlPointer(data); }
  else if (type === "link type") { return leafDataToLinkTypePointer(data); }
  else if (type === "edl type") { return leafDataToEdlTypePointer(data); }
  else { return leafDataToClip(data); }
}
