import { finalObject, listMap } from './utils';

export function LeafCache() {
  let obj = {};
  let cache = listMap();

  function getPart(pointer) {
    let list = cache.get(pointer.origin);

    if (pointer.isClip) {
      return list.find(p => p.pointer.engulfs(pointer));
    } else {
      // Note that this line will become a problem when downloading partial files
      // is properly supported.
      if (list.length > 0) { return list[0]; }
    }
    
    return undefined;
  }

  function addPart(part) {
    cache.push(part.pointer.origin, part);
  }
  
  return finalObject(obj, {
    getPart,
    addPart
  });
}
