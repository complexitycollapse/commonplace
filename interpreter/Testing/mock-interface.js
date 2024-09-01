/**
 * This is purely for testing the MockPouncer.
 */

export default function MockInterface(){
  const obj = {
    callback: undefined,
    unresolved: [],
    resolved: [],
    attachToUnresolved: callback => obj.callback = callback,
    resolve: values => {
      values.forEach(({pointer, object}) => {
        removeFromArray(obj.unresolved, p => p.denotesSame(pointer));
        obj.resolved.push(object);
      });
    },
    request: pointers => {
      obj.unresolved = obj.unresolved.concat(pointers);
      if (obj.callback) { obj.callback(pointers); }
    }
  };

  return obj;
}

function removeFromArray(array, predicate) {
  const index = array.findIndex(predicate);
  if (index > -1) {
    array.splice(index, 1);
  }
}
