import { LeafCache } from "./leaf-cache";
import { finalObject } from "@commonplace/utils";
import { wellKnownParts } from "./well-known-objects";

export function LocalCache(cache) {
  return finalObject({}, {
    getPart: pointer => {
      let cached = cache.getPart(pointer);
      if (cached[0]) {
        return cached[1];
      }

      return undefined;
    }
  });
}

export function createTestCache(parts, includeWellKnownObjects) {
  let cache = LeafCache();
  let testCache = Object.create(LocalCache(cache));
  testCache.parts = [];
  testCache.addPart = part => {
    cache.addPart(part);
    testCache.parts.push(part);
  }
  if (includeWellKnownObjects) { wellKnownParts.forEach(part => testCache.addPart(part)); }
  parts.forEach(part => testCache.addPart(part));
  testCache.addParts = parts => parts.forEach(part => testCache.addPart(part));
  testCache.internalCache = cache;
  return testCache;
}
