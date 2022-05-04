import { addProperties, finalObject } from "../utils";
import { Endset, leafDataToEndset } from "./endset";
import { Span, ClipIterator, LinkPointer } from "../pointers";

export function Link(type, ...endsets) {
  let obj = {};

  addProperties(obj, {
    type,
    endsets,
    isClip: false,
    isLink: true
  });

  function leafData() {
    return {
      typ: type,
      es: endsets.map(e => e.leafData())
    };
  }

  return finalObject(obj, {
    leafData,
    clipSource: () => ClipIterator(x => x, []),
  });
}

export const directMetalinkType = "endows direct attributes";
export const contentMetalinkType = "endows content attributes";

export const DirectMetalink = (...endsets) => Link(directMetalinkType, ...endsets);
export const ContentMetalink = (...endsets) => Link(contentMetalinkType, ...endsets);

export function leafDataToLink(leafData) {
  if (Array.isArray(leafData)) { return leafData.map(leafDataToLink); }
  let es = leafData.es.map(leafDataToEndset);
  return Link(leafData.typ, ...es);
}

export let linkTesting = {
  makeSpanLink({ type = "typeA", clipLists } = {}) {
    if (clipLists === undefined) {
      clipLists = [
        [Span("origin", 0, 10), Span("origin", 20, 15)],
        [Span("origin", 40, 5), Span("origin", 50, 20)]
      ];
    }
  
    let endsets = [], i = 0;
  
    clipLists.forEach(ss => {
      endsets.push(Endset("name" + i.toString(), ss));
      i += 1;
    });
  
    return Link(type ?? "typeA", ...endsets);
  },

  makePointerAndLink(uniqueKey = 1) {
    let stringKey = uniqueKey.toString();
    let pointer = Span(stringKey, 1, 1);
    let endset = Endset(undefined, [pointer]);
    let link = Link(stringKey, endset);
    let linkPointer = LinkPointer(stringKey);
    return [linkPointer, link];
  }
};
