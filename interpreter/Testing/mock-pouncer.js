import { addMethods, addProperties } from "@commonplace/utils";
import Part from "./part";

export default function MockPouncer(model) {
  const obj = {};

  addProperties(obj, {
    cache: [],
    model,
    unresolved: [...model.unresolved]
  });

  function unresolvedAddedCallback(newPointers) {

    // Update unresolved
    newPointers.forEach(n => {
      if (!obj.unresolved.some(p => p.denotesSame(n))) {
        obj.unresolved.push(n);
      }
    });

    // Now attempt to resolve from the cache
    const parts = newPointers.map(pointer => obj.cache.find(part => pointer.denotesSame(part.pointer))).filter(x => x);
    obj.resolve(parts);
  }

  function unresolvedcancelledCallback(cancelledPointers)
  {
    cancelledPointers.forEach(pointer => removeFromArray(obj.unresolved, p => p.denotesSame(pointer)));
  }

  addMethods(obj, {
    add: (pointer, object) => {
      obj.cache.push(Part(pointer, object));
    },
    resolve: values => {
      values.map(part => part.pointer).forEach(pointer => removeFromArray(obj.unresolved, p => p.denotesSame(pointer)));
      model.resolve(values);
    }
  });

  obj.model.attachToUnresolved(unresolvedAddedCallback, unresolvedcancelledCallback);

  return obj;
}

function removeFromArray(array, predicate) {
  const index = array.findIndex(predicate);
  if (index > -1) {
    array.splice(index, 1);
  }
}
