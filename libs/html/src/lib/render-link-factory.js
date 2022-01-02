import { finalObject, hashTable } from "@commonplace/core";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(doc, links) {
  let obj = {};

  function renderLinks() {
    let renderLinks = links.map(l => RenderLink(l));
    let hash = makeLinkHash(renderLinks);

    for (let key of hash.keys()) {
      addModifiers(key, hash);
    }
    
    return renderLinks;
  }

  function makeLinkHash(renderLinks) {
    let hash = hashTable();
    for (let i = 0; i < renderLinks.length; ++i) {
      hash.add(makeKey(doc.links[i]), renderLinks[i]);
    }
    return hash;
  }

  function makeKey(linkPointer) {
    return linkPointer.name + "/" + (linkPointer.index === undefined ? "N" : linkPointer.index.toString());
  }

  function addModifiers(key, hash) {
    let renderLink = hash.get(key);
    for(let otherKey of hash.keys()) {
      if (otherKey != key) {
        let candidate = hash.get(otherKey);
        if (candidate.endsets.some(e => e.pointers.some(p => p.pointerType === "link" && makeKey(p) === key))) {
          renderLink.modifiers.push(candidate);
        }
      }
    }
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
