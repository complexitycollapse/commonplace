export function addProperties(obj, props) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      Object.defineProperty(obj, key, {
        value: props[key],
        enumerable: true,
      });
    }
  }
}

export function addMethods(obj, props) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      Object.defineProperty(obj, key, {
        value: props[key],
      });
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
    else { return undefined; }
  }

  function hasKey(name) {
    return Object.prototype.hasOwnProperty.call(table, name);
  }

  addMethods(obj, {
    add,
    get,
    hasKey
  });

  return obj;
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

  addMethods(obj, {
    push,
    get: table.get,
    hasKey: table.hasKey
  });

  return obj;
}
