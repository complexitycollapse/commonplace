import { addProperties } from "@commonplace/core";

export function RenderEndset(endset, renderLink) {
  let obj = {};
  let index = renderLink.endsets.indexOf(endset);
  
  addProperties(obj, {
    index,
    renderLink,
    name: endset.name,
    pointers: endset.pointers
  });

  return obj;
}
