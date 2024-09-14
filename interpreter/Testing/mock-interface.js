/**
 * This is purely for testing the MockPouncer.
 */

export default function MockInterface() {
  const obj = {
    addedCallback: undefined,
    cancelledCallback: undefined,
    outstanding: [],
    resolved: [],
    attachToOutstanding: (addedCallback, cancelledCallback) => {
      obj.addedCallback = addedCallback;
      obj.cancelledCallback = cancelledCallback;
    },
    resolve: values => {
      values.forEach(({pointer, object}) => {
        removeFromArray(obj.outstanding, p => p.denotesSame(pointer));
        obj.resolved.push(object);
      });
    },
    request: pointers => {
      obj.outstanding = obj.outstanding.concat(pointers);
      if (obj.addedCallback) { obj.addedCallback(pointers); }
    },
    cancel: pointers => {
      pointers.forEach(pointer => removeFromArray(obj.outstanding, p => p.denotesSame(pointer)));
      if (obj.cancelledCallback) { obj.cancelledCallback(pointers); }
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
