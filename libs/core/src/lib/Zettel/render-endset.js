import { addProperties } from "../utils";

export function RenderEndset(endset, renderLink) {
  let obj = {};
  
  addProperties(obj, {
    index: endset.index,
    renderLink,
    name: endset.name,
    pointers: endset.pointers,
    endset
  });

  return obj;
}
