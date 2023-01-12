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

  function getEnd(name, index = 0) {
    if (index < 0) { throw `Invalid index passed to getEnd: ${index}`; }
    for(let i = 0; i < ends.length; ++i) {
      let cur = ends[i];
      if (cur.name === name) {
        if (index > 0) {
          --index;
        } else {
          return cur;
        }
      }
    }
  }

  return finalObject(obj, {
    leafData,
    clipSource: () => ClipIterator(x => x, []),
    forEachPointer,
    getEnd
  });
}

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
