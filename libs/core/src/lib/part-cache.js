import { finalObject, listTable, hashTable } from './utils';

export function PartCache() {
  let obj = {};
  let partCache = listTable();
  let objectCache = hashTable();

  function getPart(clip) {
    if(partCache.hasKey(clip.origin)) {
      return partCache.get(clip.origin).find(p => p.engulfs(clip));
    }
    return undefined;
  }

  function addPart(part) {
    partCache.push(part.origin, part);
  }

  function addObject(pointer, object) {
    objectCache.add(pointer.name, object);
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
