export function commonplaceCore() {
  return {};
}

function addProperties(obj, props) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      Object.defineProperty(obj, key, {
        value: props[key],
        enumerable: true
      })
    }
  }
}

function addMethods(obj, props) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      Object.defineProperty(obj, key, {
        value: props[key]
      })
    }
  }
}

export function span(origin, start, length) {
  let s = { };
  addProperties(s, {origin, start, length});

  function clone({origin = s.origin, start = s.start, length = s.length} = {}) {
    return span(origin, start, length);
  }

  function equalOrigin(span) {
    return span.origin == origin;
  }

  function contains(point) {
    let offset = point - start;
    return offset >= 0 && offset < length;
  }

  addMethods(s, {
    clone,
    next: () => start + length,
    end: () => start + length - 1,
    equalOrigin,
    startDiff: (span) => start - span.start,
    endDiff: (span) => s.end() - span.end(),
    displace: (n) => clone({ start: start + n}),
    contains
  });

  return s;
}
