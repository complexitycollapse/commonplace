import { editIterator } from "./edit-iterators";
import { addProperties, addMethods } from "./utils";

export function span(origin, start, length) {
  let obj = {};
  addProperties(obj, {
    origin,
    start,
    length,
    isEdit: true,
    editType: "span",
    next: start + length,
    end: start + length - 1
  });

  function clone({
    origin = obj.origin,
    start = obj.start,
    length = obj.length } = {}) {
    return span(origin, start, length);
  }

  function equalOrigin(span) {
    return span.origin == origin;
  }

  function contains(point) {
    let offset = point - start;
    return offset >= 0 && offset < length;
  }

  function abuts(span) {
    return equalOrigin(span) && obj.next === span.start;
  }

  function overlaps(span) {
    return obj.equalOrigin(span) && !(obj.end < span.start || span.end < start);
  }

  function canMergeWith(span) {
    return obj.overlaps(span) || obj.abuts(span) || span.abuts(obj);
  }

  function merge(sp) {
      let newStart = Math.min(start, sp.start);
      return span(obj.origin, newStart, Math.max(obj.next, sp.next) - newStart);
  }

  function crop(startAdjust, newLength) {
    startAdjust = startAdjust > 0 ? startAdjust : 0;
    newLength = Math.min(newLength ?? length, length - startAdjust);
    return clone({
      start: start + startAdjust,
      length: newLength});
  }

  function editSource() {
    return editIterator(x => x, [obj]);
  }

  function leafData() {
    return { typ: obj.editType, ori: origin, st: start, ln: length };
  }

  addMethods(obj, {
    clone,
    equalOrigin,
    startDiff: (span) => start - span.start,
    endDiff: (span) => obj.end - span.end,
    displace: (n) => clone({ start: start + n }),
    contains,
    abuts,
    overlaps,
    canMergeWith,
    merge,
    crop,
    editSource,
    leafData
  });

  return obj;
}

export function leafDataToSpan(leafData) {
  return span(leafData.ori, leafData.st, leafData.ln);
}
