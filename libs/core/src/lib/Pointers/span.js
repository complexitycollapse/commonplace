import { addProperties, finalObject } from "../utils";
import { Clip } from "./clip";
import { Part } from "../part";

export function Span(origin, start, length, originalContext) {
  let obj = Clip("span", origin, r => buildPartFromContent(obj, r), () => `span:${origin}:${start}:${length}`, originalContext);
  addProperties(obj, {
    start,
    length,
    next: start + length,
    end: start + length - 1
  });

  function clone({
    origin = obj.origin,
    start = obj.start,
    length = obj.length } = {}) {
    return Span(origin, start, length);
  }

  function equals(span) {
    return obj.sameType(span) && obj.equalOrigin(span) && start === span.start && length  === span.length;
  }

  function contains(point) {
    let offset = point - start;
    return offset >= 0 && offset < length;
  }

  function engulfs(span) {
    return  obj.sameType(span) && obj.equalOrigin(span) && contains(span.start) && contains(span.end);
  }

  function abuts(span) {
    return obj.sameType(span) && obj.equalOrigin(span) && obj.next === span.start;
  }

  function overlaps(span) {
    return obj.sameType(span) && obj.equalOrigin(span) && !(obj.end < span.start || span.end < start);
  }

  function overlappingButNotEngulfing(span) {
    return obj.overlaps(span) && !obj.engulfs(span) && !span.engulfs(obj);
  }

  function canMergeWith(span) {
    return obj.overlaps(span) || obj.abuts(span) || span.abuts(obj);
  }

  function merge(sp) {
      let newStart = Math.min(start, sp.start);
      return Span(obj.origin, newStart, Math.max(obj.next, sp.next) - newStart);
  }

  function crop(startAdjust, newLength) {
    startAdjust = Math.max(startAdjust, 0);
    newLength = Math.min(newLength ?? length, length - startAdjust);
    return clone({
      start: start + startAdjust,
      length: newLength});
  }

  function intersect(s) {
    if (!overlaps(s)) {
      return [false, undefined];
    }
    let newStart = Math.max(s.start, start);
    return [true, Span(
                    origin,
                    newStart,
                    Math.min(s.next, obj.next) - newStart)];
  }

  function clipPart(part) {
    let s = part.pointer;

    let intersection = intersect(s);
    if (!intersection[0]) {
      return [false, undefined];
    }

    let newSpan = intersection[1];

    return [true, Part(
      newSpan,
      part.content.substring(newSpan.start - s.start, newSpan.next - s.start))];
  }


  function leafData() {
    return { typ: obj.clipType, ori: origin, st: start, ln: length };
  }

  return finalObject(obj, {
    clone,
    startDiff: (span) => start - span.start,
    endDiff: (span) => obj.end - span.end,
    displace: (n) => clone({ start: start + n }),
    contains,
    equals,
    engulfs,
    abuts,
    overlaps,
    canMergeWith,
    merge,
    crop,
    leafData,
    intersect,
    clipPart,
    overlappingButNotEngulfing
  });
}

export function leafDataToSpan(leafData) {
  return Span(leafData.ori, leafData.st, leafData.ln);
}

async function buildPartFromContent(originalSpan, response) {
  let content = await response.text();
  return Part(Span(originalSpan.origin, 0, content.length), content);
}

export let spanTesting = {

  makeSpan({origin = "origin", start = 10, length = 20} = {}) {
    return Span(origin, start, length);
  },

  makeSpans(qty) {
    let result = [];
    for (let i = 0; i < qty; i++) {
      result.push(Span(i.toString(), i, 5));
    }
  
    return result;
  },

  toEqualSpan(actualSpan, expectedSpan) {
    return spanTesting.compareElements(actualSpan, expectedSpan, (actual, expected) => {
      return actual.origin === expected.origin &&
        actual.start === expected.start &&
        actual.length === expected.length;
    })
  },

  compareElements(actual, expected, testFn) {
    if (actual === undefined) return {
      message: () => `expected ${JSON.stringify(expected)} but received undefined`,
      pass: false
    };
  
    if (actual === undefined) return {
      message: () => `undefined expectation, actual was ${JSON.stringify(actual)}`,
      pass: false
    };
  
    let pass = testFn(actual, expected);
      
  
    if (pass) {
      return {
        message: () =>
          `expected ${JSON.stringify(actual)} to not equal ${JSON.stringify(
            expected
          )}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${JSON.stringify(actual)} to equal ${JSON.stringify(
            expected
          )}`,
        pass: false,
      };
    }
  }
}
