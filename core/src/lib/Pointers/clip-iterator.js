export function ClipIterator(callback, initialState) {
  let state = initialState;
  let positionCount = undefined, nextPosition = 0;
  
  let iterator = () => {
    let callbackResult = callback(state);
    positionCount = nextPosition;
    
    if (callbackResult == undefined) {
      state = undefined;
      return undefined;
    }

    let [clip, newState] = callbackResult;

    if (clip) {
      nextPosition += clip.length;
    }
    state = newState;
    return clip;
  };

  iterator.position = () => positionCount;

  iterator.forEach = fn => {
    for(let next = iterator(); next !== undefined; next = iterator()) {
      fn(next, positionCount);
    }
  };

  return iterator;
}
