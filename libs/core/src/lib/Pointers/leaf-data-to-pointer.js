import { leafDataToClip } from "../model";
import { leafDataToClipTypePointer } from "./clip-type-pointer";
import { leafDataToEdlPointer } from "./edl-pointer";
import { leafDataToEdlTypePointer } from "./edl-type-pointer";
import { leafDataToEndsetPointer } from "./endset-pointer";
import { leafDataToLinkPointer } from "./link-pointer";
import { leafDataToLinkTypePointer } from './link-type-pointer';

export function leafDataToPointer(data) {
  let type = data.typ;

  if (type === "link") { return leafDataToLinkPointer(data); }
  else if (type === "edl") { return leafDataToEdlPointer(data); }
  else if (type === "link type") { return leafDataToLinkTypePointer(data); }
  else if (type === "edl type") { return leafDataToEdlTypePointer(data); }
  else if (type === "endset") { return leafDataToEndsetPointer(data); }
  else if (type === "clip type") { return leafDataToClipTypePointer(data); }
  else { return leafDataToClip(data); }
}
