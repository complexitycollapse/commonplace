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
    for (let i =0; i < renderLinks.length; ++i) {
      hash.add(doc.overlay[i], renderLinks[i]);
    }
    return hash;
  }

  function addModifiers(name, hash) {
    let renderLink = hash.get(name);
    for(let key of hash.keys()) {
      if (key != name) {
        let candidate = hash.get(key);
        if (candidate.endsets.some(e => e.pointers.some(p => p.pointerType === "link" && p.linkName === name))) {
          renderLink.modifiers.push(candidate);
        }
      }
    }
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
