import { LeafCache } from "./leaf-cache";
import { finalObject } from "@commonplace/utils";
import { wellKnownParts } from "./well-known-objects";

export function LocalCache(cache) {
  return finalObject({}, {
    getPartLocally: pointer => {
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
  if (includeWellKnownObjects) { wellKnownParts.forEach(part => cache.addPart(part)); }
  parts.forEach(part => cache.addPart(part));
  return LocalCache(cache);
}
