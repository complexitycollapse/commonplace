import { Edl } from "./edl";

export function Doc(clips, links) {
  return Edl("doc", clips, links);
}
