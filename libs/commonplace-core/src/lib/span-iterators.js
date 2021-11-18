export function spanIterator(callback, initialState) {
  let state = initialState;
  let positionCount = undefined, nextPosition = 0;
  
  let iterator = () => {
    let callbackResult = callback(state);
    positionCount = nextPosition;
    
    if (callbackResult == undefined) {
      state = undefined;
      return undefined;
    }

    let [span, newState] = callbackResult;

    if (span) {
      nextPosition += span.length;
    }
    state = newState;
    return span;
  };

  iterator.position = () => positionCount;

  iterator.forEach = fn => {
    for(let next = iterator(); next !== undefined; next = iterator()) {
      fn(next, positionCount);
    }
  };

  return iterator;
}
