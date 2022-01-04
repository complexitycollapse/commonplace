import { addProperties, finalObject } from "@commonplace/core";
import { Fragment } from "./fragment";

let typeMap = {
  paragraph: [null, "p"],
  italics: [{italic: true}],
  bold: [{bold: true}],
  title: [null, "h1"],
  underline: [{underline: true}],
  "strike through": [{"line-through": true}],
  capitalize: [{textTransform: "capitalize"}],
  uppercase: [{textTransform: "uppercase"}],
  lowercase: [{textTransform: "lowercase"}],
  "left aligned text": [{textAlign: "left"}],
  "right aligned text": [{textAlign: "right"}],
  "centre aligned text": [{textAlign: "center"}],
  "justified text": [{textAlign: "justify"}]
};

export function RenderLink(link) {
  let renderLink = { modifiers: [] };
  let [inlineStyle, fragmentTag] = typeMap[link.type] ?? [null, null];
  inlineStyle = inlineStyle ?? {};

  addProperties(renderLink, {
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

  function style() {
    let mod = renderLink.modifiers.find(l => l.style());
    return mod ? mod.style() : inlineStyle;
  }

  return finalObject(renderLink, {
    fragments,
    style
  });
}
