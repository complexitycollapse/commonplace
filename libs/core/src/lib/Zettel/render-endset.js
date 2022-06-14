import { addProperties, finalObject } from "../utils";

export function RenderEndset(endset, renderLink) {
  let obj = {};

  // TODO: this doesn't work at all. If the link points to an EDL or other link then they need
  // to be pursued recursively to get all content. specifiesContent is therefore a bad property.
  // For now it's just a hack that makes sure inline pointers are treated correctly.
  let linkedContent = endset.pointers.filter(p => p.specifiesContent)
    .map(p => [p, p.inlineText]); // will be undefined except for inline pointers

  function resolveContent(part) {
    obj.linkedContent.filter(x => x[0].denotesSame(part.pointer)).forEach(entry => entry[1] = part.content);
  }

  function outstandingRequests() {
    return obj.linkedContent.filter(x => !x[1]).map(x => [x[0], resolveContent]);
  }
  
  addProperties(obj, {
    index: endset.index,
    renderLink,
    name: endset.name,
    pointers: endset.pointers,
    endset,
    linkedContent
  });

  return finalObject(obj, {
    outstandingRequests
  });
}
