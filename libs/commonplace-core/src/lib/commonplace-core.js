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

  addMethods(s, {clone});

  return s;
}
