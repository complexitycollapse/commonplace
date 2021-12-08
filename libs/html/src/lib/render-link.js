import { addProperties } from "@commonplace/core";

let typeMap = {
  paragraph: [null, null, "p"]
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
