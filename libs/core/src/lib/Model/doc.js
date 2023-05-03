import { LinkPointer } from "../pointers";
import { Edl } from "./edl";

export function Doc(clips, links) {
  return Edl(LinkPointer("document"), clips, links);
}
