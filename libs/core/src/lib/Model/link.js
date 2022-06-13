import { addProperties, finalObject } from "../utils";
import { Endset, leafDataToEndset } from "./endset";
import { Span, ClipIterator, LinkPointer } from "../pointers";

export function Link(type, ...endsetSpecs) {
  let endsets = endsetSpecs.map((e, i) => Endset(e[0], e[1], i));
  return makeLinkInternal(type, endsets);
}

function makeLinkInternal(type, endsets) {
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

  function forEachPointer(fn) {
    endsets.forEach(e => {
      e.pointers.forEach(p => {
        fn(p, e, obj);
      });
    });
  }

  return finalObject(obj, {
    leafData,
    clipSource: () => ClipIterator(x => x, []),
    forEachPointer
  });
}

export const directMetalinkType = "endows direct attributes";
export const contentMetalinkType = "endows content attributes";

export const DirectMetalink = (...endsets) => Link(directMetalinkType, ...endsets);
export const ContentMetalink = (...endsets) => Link(contentMetalinkType, ...endsets);

export function leafDataToLink(leafData) {
  if (Array.isArray(leafData)) { return leafData.map(leafDataToLink); }
  let es = leafData.es.map((e, i) => leafDataToEndset(e, i));
  return makeLinkInternal(leafData.typ, es);
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
      endsets.push(["name" + i.toString(), ss]);
      i += 1;
    });
  
    return Link(type ?? "typeA", ...endsets);
  },

  makePointerAndLink(uniqueKey = 1) {
    let stringKey = uniqueKey.toString();
    let pointer = Span(stringKey, 1, 1);
    let endset = [undefined, [pointer]];
    let link = Link(stringKey, endset);
    let linkPointer = LinkPointer(stringKey);
    return [linkPointer, link];
  }
};
