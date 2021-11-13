import { addProperties, addMethods } from "./utils";

export function span(origin, start, length) {
  let s = {};
  addProperties(s, { origin, start, length });

  function clone({
    origin = s.origin,
    start = s.start,
    length = s.length } = {}) {
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
    return equalOrigin(span) && s.next() === span.start;
  }

  function overlaps(span) {
    return s.equalOrigin(span) && !(s.end() < span.start || span.end() < start);
  }

  function canMergeWith(span) {
    return s.overlaps(span) || s.abuts(span) || span.abuts(s);
  }

  function merge(sp) {
      let newStart = Math.min(start, sp.start);
      return span("o", newStart, Math.max(s.next(), sp.next()) - newStart);
  }

  addMethods(s, {
    clone,
    next: () => start + length,
    end: () => start + length - 1,
    equalOrigin,
    startDiff: (span) => start - span.start,
    endDiff: (span) => s.end() - span.end(),
    displace: (n) => clone({ start: start + n }),
    contains,
    abuts,
    overlaps,
    canMergeWith,
    merge,
    divide: (length) => length <= 0 || length >= s.length
        ? [s]
        : [clone({length}), clone({start: start + length, length: s.length - length})]
  });

  return s;
}
