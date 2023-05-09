export default function resolveTypeAndMetalinks(typePointer, cache) {
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

  function getMetalinks(type) {
    let metalinkPairs = [];

    if (type?.isLink) {
      type.forEachPointer(metalinkPointer => {
        if (metalinkPointer.pointerType === "link") {
          let metalink = cache.getPart(metalinkPointer).content;
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
