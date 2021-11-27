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
