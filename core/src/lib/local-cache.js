import { finalObject } from "@commonplace/utils";

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
