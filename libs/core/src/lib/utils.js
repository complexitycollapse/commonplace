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

export function hashTable() {
  let obj = {};
  let table = {};

  function add(key, value) {
    table[key] = value;
  }

  function get(key) {
    if (hasKey(key)) { return table[key]; }
    else { return []; }
  }

  function hasKey(name) {
    return Object.prototype.hasOwnProperty.call(table, name);
  }

  function keys() {
    return Object.getOwnPropertyNames(table);
  }

  return finalObject(obj, {
    add,
    get,
    hasKey,
    keys
  });
}
 
export function listTable() {
  let obj = {};
  let table = hashTable();

  function push(key, value) {
    if (table.hasKey(key)) {
      table.get(key).push(value);
    } else {
      table.add(key, [value]);
    }
  }

  return finalObject(obj, {
    push,
    get: table.get,
    hasKey: table.hasKey,
    keys: table.keys
  });
}
