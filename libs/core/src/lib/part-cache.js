import { finalObject, listTable, hashTable } from './utils';

export function PartCache() {
  let obj = {};
  let partCache = listTable();
  let objectCache = hashTable();

  function getPart(edit) {
    if(partCache.hasKey(edit.origin)) {
      return partCache.get(edit.origin).find(p => p.engulfs(edit));
    }
    return undefined;
  }

  function addPart(part) {
    partCache.push(part.origin, part);
  }

  function addObject(name, object) {
    objectCache.add(name, object);
  }

  function getObject(name) {
    return objectCache.get(name);
  }
  
  return finalObject(obj, {
    getPart,
    addPart,
    addObject,
    getObject
  });
}
