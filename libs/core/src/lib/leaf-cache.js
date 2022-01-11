import { finalObject, listMap } from './utils';

export function LeafCache() {
  let obj = {};
  let cache = listMap();

  function getPart(pointer) {
    let list = cache.get(pointer.origin);

    if (pointer.isClip) {
      let matching = list.find(p => p.pointer.engulfs(pointer));
      return matching ? [true, matching] : [false, undefined];
    } else {
      // Note that this line will become a problem when downloading partial files
      // is properly supported.
      if (list.length > 0) { return [true, list[0]]; }
    }
    
    return [false, undefined];
  }

  function addPart(part) {
    cache.push(part.pointer.origin, part);
  }
  
  return finalObject(obj, {
    getPart,
    addPart
  });
}
