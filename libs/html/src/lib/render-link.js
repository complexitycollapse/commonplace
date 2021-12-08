import { addProperties } from "@commonplace/core";

let typeMap = {
  paragraph: [null, null, "p"],
  italics: [null, {fontStyle: "italic"}],
  bold: [null, {fontWeight: "bold"}]
};

export function RenderLink(link) {
  let renderLink = Object.create(link);
  let [innerTag, style, fragmentTag] = typeMap[link.type] ?? [null, null, null];

  addProperties(renderLink, {
    innerTag,
    style,
    fragmentTag
  });

  return renderLink;
}
