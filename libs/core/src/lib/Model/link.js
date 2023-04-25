import { addProperties, finalObject } from "@commonplace/utils";
import { Span, ClipIterator, LinkPointer, leafDataToPointer } from "../pointers";

export function Link(type, ...endSpecs) {
  let ends = endSpecs.map((e, i) => {
    if (!Array.isArray(e[1])) {
      throw "Pointers argument in end must be an array";
    }
    return { name: e[0], pointers: e[1], index: i };
  });

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
      typ: typeof type === "string" ? type : type.leafData(),
      es: ends.map(e => endLeafData(e))
    };
  }

  function endLeafData(end) {
    let data = end.name ? { name: end.name } : {};
    data.ptr = end.pointers.map(p => p.leafData());
    return data;
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
    if (name === "") { name = undefined; }
    for(let i = 0; i < this.ends.length; ++i) {
      let cur = this.ends[i];
      if (cur.name === name) {
        if (index > 0) {
          --index;
        } else {
          return cur;
        }
      }
    }
  }

  function getEnds(name) {
    let result = [];
    this.ends.forEach(end => {
      if (end.name === name) { result.push(end); }
    });
    return result;
  }

  return finalObject(obj, {
    leafData,
    clipSource: () => ClipIterator(x => x, []),
    forEachPointer,
    getEnd,
    getEnds
  });
}

export function leafDataToLink(leafData) {
  if (Array.isArray(leafData)) { return leafData.map(leafDataToLink); }
  let es = leafData.es.map((e, i) => leafDataToEnd(e, i));
  let type = typeof leafData.typ === "string" ? leafData.typ : leafDataToPointer(leafData.typ);
  return makeLinkInternal(type, es);
}

function leafDataToEnd(leafData, index) {
  let ptr = leafData.ptr;
  let pointers = ptr.map(leafDataToPointer);

  return { name: leafData?.name, pointers, index };
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
