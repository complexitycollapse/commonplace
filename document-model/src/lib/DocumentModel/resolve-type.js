/**
 * Resolves the type and metalinks for a given type pointer.
 * Metalinks are those links found in the ends the type link.
 *
 * @param {Object} typePointer - The pointer to the type. It can be undefined, a link pointer or an inline pointer.
 * @param {Object} cache - The cache of parts.
 * @returns {[*, Array]} - An array where the first element is the resolved type and the second element is an array of metalink pairs.
 */
export default function resolveTypeAndMetalinks(typePointer, cache) {
  /**
   * Retrieves the type denoted by the type pointer.
   *
   * @returns {*} - The resolved type, which can be undefined, a link or inline text.
   */
  function getType() {
    if (typePointer === undefined) {
      return undefined;
    } else if (typePointer.pointerType === "link") {
      let typePart = cache.getPart(typePointer);
      return typePart.content;
    } else {
      return typePointer.inlineText;
    }
  }

  /**
   * Retrieves the metalinks for a given type.
   *
   * @param {*} type - The type for which to retrieve metalinks.
   * @returns {Array} - An array of metalink pairs, each containing a metalink pointer and the denoted link.
   */
  function getMetalinks(type) {
    let metalinkPairs = [];

    if (type?.isLink) {
      type.forEachPointer(metalinkPointer => {
        if (metalinkPointer.pointerType === "link") {
          let metalinkPart = cache.getPart(metalinkPointer);
          let metalink = metalinkPart.content;
          metalinkPairs.push([metalinkPointer, metalink]);
        }
      });
    }

    return metalinkPairs;
  }

  let type = getType();
  let metalinkPairs = getMetalinks(type);
  return [type, metalinkPairs];
}

