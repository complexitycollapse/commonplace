import { LeafCache } from "./leaf-cache";
import { finalObject } from "@commonplace/utils";

export default function LocalCache(cache) {
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

export function createTestCache(parts) {
  let cache = LeafCache();
  parts.forEach(part => cache.addPart(part));
  return LocalCache(cache);
}
