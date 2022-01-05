import { finalObject, listMap } from './utils';

export function PartCache() {
  let obj = {};
  let partCache = listMap();
  let objectCache = new Map();

  function getPart(clip) {
    if(partCache.has(clip.origin)) {
      return partCache.get(clip.origin).find(p => p.engulfs(clip));
    }
    return undefined;
  }

  function addPart(part) {
    partCache.push(part.origin, part);
  }

  function addObject(pointer, object) {
    objectCache.set(pointer.name, object);
  }

  function getObject(pointer) {
    return objectCache.get(pointer.name);
  }
  
  return finalObject(obj, {
    getPart,
    addPart,
    addObject,
    getObject
  });
}
