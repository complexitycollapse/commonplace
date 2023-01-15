export function finalObject(obj, methods) {
  addMethods(obj, methods);
  Object.freeze(obj);
  return obj;
}

export function addProperties(obj, props) {
  forAllOwnProperties(props, key => {
    Object.defineProperty(obj, key, {
      value: props[key],
      enumerable: true,
    })
  });
}

export function decorateObject(obj, props) {
  return Object.freeze(Object.assign(Object.create(obj), props));
}

export function addMethods(obj, props) {
  forAllOwnProperties(props, key => {
    Object.defineProperty(obj, key, {
      value: props[key]
    })
  });
}

export function forAllOwnProperties(obj, callback) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      callback(key);
    }
  }
}
 
export function listMap() {
  let obj = {};
  let table = new Map();

  addProperties(obj, { table });

  function push(key, value) {
    if (table.has(key)) {
      table.get(key).push(value);
    } else {
      table.set(key, [value]);
    }
  }

  return finalObject(obj, {
    push,
    get: key => table.get(key) ?? [],
    has: key => table.has(key),
    entries: () => table.entries(),
    values: () => table.values()
  });
}

export function listMapFromList(keyFn, valueFn, list) {
  let map = listMap();
  list.forEach(item => map.push(keyFn(item), valueFn(item)));
  return map;  
}

export function mergeObjects(target, source) {
  Object.entries(source).forEach(e => target[e[0]] = e[1]);
}

export function mergeMaps(target, source) {
  [...source.entries()].forEach(e=> target.set(e[0], e[1]));
}

export function memoize(initFn) {
  let value = undefined, memoized = false;

  let fn = () => {
    if (!memoized) {
      value = initFn();
      memoized = true;
    }
    return value;
  }

  fn.reset = () => {
    value = undefined;
    memoized = false;
  }

  return fn;
}

export function memoizedProperty(host, name, initFn) {
  Object.defineProperty(host, name, {
    configurable: true,
    enumerable: true,
    get: memoize(() => initFn.apply(host)),
    writable: true
  });
}
