import { addProperties, finalObject } from "../utils";

export function RenderEnd(end, renderLink) {
  let obj = {};

  // TODO: this doesn't work at all. If the link points to an EDL or other link then they need
  // to be pursued recursively to get all content. specifiesContent is therefore a bad property.
  // For now it's just a hack that makes sure inline pointers are treated correctly.
  let linkedContent = end.pointers.filter(p => p.specifiesContent)
    .map(p => [p, p.inlineText]); // will be undefined except for inline pointers

  function resolveContent(part) {
    obj.linkedContent.filter(x => x[0].denotesSame(part.pointer)).forEach(entry => entry[1] = part.content);
  }

  function outstandingRequests() {
    return obj.linkedContent.filter(x => !x[1]).map(x => [x[0], resolveContent]);
  }

  function concatatext() {
    // TODO: this is an ugly hack to get around the fact that I am currently using boolean and
    // string as attribute values, when really the endowed values should be strings that get
    // parsed into meaningful values when they are assigned to the attribute.
    if (end.pointers.length === 1 && end.pointers[0].inlineText !== undefined) {
      return end.pointers[0].inlineText;
    }

    if (linkedContent.findIndex(c => typeof c[1] != "string") != -1) {
      return undefined;
    }

    return linkedContent.map(c => c[1]).join("");
  }
  
  addProperties(obj, {
    index: end.index,
    renderLink,
    name: end.name,
    pointers: end.pointers,
    end,
    linkedContent
  });

  return finalObject(obj, {
    outstandingRequests,
    concatatext,
    resolveContent
  });
}
