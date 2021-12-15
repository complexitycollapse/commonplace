import { addProperties, finalObject } from "./utils";
import { Edit } from "./edit";

export function Span(origin, start, length) {
  let obj = Edit("span", origin);
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

  function contains(point) {
    let offset = point - start;
    return offset >= 0 && offset < length;
  }

  function engulfs(span) {
    return obj.equalOrigin(span) && contains(span.start) && contains(span.end);
  }

  function abuts(span) {
    return obj.equalOrigin(span) && obj.next === span.start;
  }

  function overlaps(span) {
    return obj.equalOrigin(span) && !(obj.end < span.start || span.end < start);
  }

  function canMergeWith(span) {
    return obj.overlaps(span) || obj.abuts(span) || span.abuts(obj);
  }

  function merge(sp) {
      let newStart = Math.min(start, sp.start);
      return Span(obj.origin, newStart, Math.max(obj.next, sp.next) - newStart);
  }

  function crop(startAdjust, newLength) {
    startAdjust = startAdjust > 0 ? startAdjust : 0;
    newLength = Math.min(newLength ?? length, length - startAdjust);
    return clone({
      start: start + startAdjust,
      length: newLength});
  }

  function intersect(s) {
    let newStart = Math.max(s.start, start);
    return Span(
      origin,
      newStart,
      Math.min(s.next, obj.next) - newStart);
  }

  function leafData() {
    return { typ: obj.editType, ori: origin, st: start, ln: length };
  }

  return finalObject(obj, {
    clone,
    startDiff: (span) => start - span.start,
    endDiff: (span) => obj.end - span.end,
    displace: (n) => clone({ start: start + n }),
    contains,
    engulfs,
    abuts,
    overlaps,
    canMergeWith,
    merge,
    crop,
    leafData,
    intersect
  });
}

export function leafDataToSpan(leafData) {
  return Span(leafData.ori, leafData.st, leafData.ln);
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
