import { addProperties, finalObject } from "@commonplace/core";
import { Fragment } from "./fragment";

let typeMap = {
  paragraph: [null, null, "p"],
  italics: [null, {fontStyle: "italic"}],
  bold: [null, {fontWeight: "bold"}],
  title: ["h1"]
};

export function RenderLink(link) {
  let renderLink = {};
  let [innerTag, style, fragmentTag] = typeMap[link.type] ?? [null, null, null];

  addProperties(renderLink, {
    innerTag,
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
        if (p.isEdit) {
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
