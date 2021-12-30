import { addProperties, finalObject } from "@commonplace/core";
import { Fragment } from "./fragment";

let typeMap = {
  paragraph: [null, "p"],
  italics: [{fontStyle: "italic"}],
  bold: [{fontWeight: "bold"}],
  title: [null, "h1"],
  underline: [{textDecoration: "underline"}],
  "strike through": [{textDecoration: "line-through"}]
};

export function RenderLink(link) {
  let renderLink = { modifiers: [] };
  let [style, fragmentTag] = typeMap[link.type] ?? [null, null];

  addProperties(renderLink, {
    style,
    fragmentTag,
    link,
    endsets: link.endsets,
    type: link.type,
    isStructural: fragmentTag ? true : false
  });

  function fragments() {
  let fragments = [];

  if (fragmentTag) {
    link.endsets.forEach(e => {
      e.pointers.forEach(p => {
        if (p.isClip) {
          fragments.push(Fragment(p, e, renderLink));
        }
      });
    });
  }

  return fragments;
  }

  return finalObject(renderLink, {
    fragments
  });
}
