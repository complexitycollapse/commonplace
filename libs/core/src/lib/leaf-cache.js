import { Part } from './part';
import { finalObject, listMap } from "@commonplace/utils";

export function LeafCache() {
  let obj = {};
  let cache = listMap();

  function getPart(pointer) {
    if (pointer.pointerType === "inline") {
      return [true, Part(pointer, pointer.inlineText)];
    }

    let list = cache.get(pointer.origin);

    if (pointer.isClip) {
      let matching = list.find(p => p.pointer.engulfs(pointer));
      return matching ? [true, pointer.clipPart(matching)[1]] : [false, undefined];
    } else {
      if (list.length > 0) { return [true, pointer.clipPart(list[0])[1]]; }
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
