export function editIterator(callback, initialState) {
  let state = initialState;
  let positionCount = undefined, nextPosition = 0;
  
  let iterator = () => {
    let callbackResult = callback(state);
    positionCount = nextPosition;
    
    if (callbackResult == undefined) {
      state = undefined;
      return undefined;
    }

    let [edit, newState] = callbackResult;

    if (edit) {
      nextPosition += edit.length;
    }
    state = newState;
    return edit;
  };

  iterator.position = () => positionCount;

  iterator.forEach = fn => {
    for(let next = iterator(); next !== undefined; next = iterator()) {
      fn(next, positionCount);
    }
  };

  return iterator;
}
