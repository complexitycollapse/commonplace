import { addProperties, finalObject } from './utils';

export function RenderPointer(pointer, renderEndset) {
  let obj = {};

  addProperties(obj, {
    pointer,
    renderEndset,
    renderLink: renderEndset.renderLink
  });

  return finalObject(obj);
}
