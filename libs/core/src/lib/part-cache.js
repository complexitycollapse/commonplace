import { addMethods } from './utils';

export function PartCache() {
  let obj = {};
  let cache = {};

  function getPart(name) {
    if(Object.prototype.hasOwnProperty.call(cache, name)) {
      return cache[name];
    }
    return undefined;
  }

  function addPart(name, part) {
    cache[name] = part;
  }
  
  addMethods(obj, {
    getPart,
    addPart
  });

  return obj;
}
