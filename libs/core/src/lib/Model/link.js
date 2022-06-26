import { addProperties, finalObject } from "@commonplace/utils";
import { End, leafDataToEnd } from "./end";
import { Span, ClipIterator, LinkPointer } from "../pointers";

export function Link(type, ...endSpecs) {
  let ends = endSpecs.map((e, i) => End(e[0], e[1], i));
  return makeLinkInternal(type, ends);
}

function makeLinkInternal(type, ends) {
  let obj = {};

  addProperties(obj, {
    type,
    ends,
    isClip: false,
    isLink: true
  });

  function leafData() {
    return {
      typ: type,
      es: ends.map(e => e.leafData())
    };
  }

  function forEachPointer(fn) {
    ends.forEach(e => {
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
export const groupMetalinkType = "defines group";

export const DirectMetalink = (...ends) => Link(directMetalinkType, ...ends);
export const ContentMetalink = (...ends) => Link(contentMetalinkType, ...ends);

export function leafDataToLink(leafData) {
  if (Array.isArray(leafData)) { return leafData.map(leafDataToLink); }
  let es = leafData.es.map((e, i) => leafDataToEnd(e, i));
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
  
    let ends = [], i = 0;
  
    clipLists.forEach(ss => {
      ends.push(["name" + i.toString(), ss]);
      i += 1;
    });
  
    return Link(type ?? "typeA", ...ends);
  },

  makePointerAndLink(uniqueKey = 1) {
    let stringKey = uniqueKey.toString();
    let pointer = Span(stringKey, 1, 1);
    let end = [undefined, [pointer]];
    let link = Link(stringKey, end);
    let linkPointer = LinkPointer(stringKey);
    return [linkPointer, link];
  }
};
