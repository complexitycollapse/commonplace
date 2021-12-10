import { addMethods } from './utils';

export function PartCache() {
  let obj = {};
  let cache = {};

  function getPart(edit) {
    if(exists(edit.origin)) {
      return cache[edit.origin].find(p => p.engulfs(edit));
    }
    return undefined;
  }

  function addPart(part) {
    if (exists(part.origin)) {
      cache[part.origin].push(part);
    } else {
      cache[part.origin] = [part];
    }
  }

  function exists(name) {
    return Object.prototype.hasOwnProperty.call(cache, name);
  }
  
  addMethods(obj, {
    getPart,
    addPart
  });

  return obj;
}
