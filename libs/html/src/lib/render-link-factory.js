import { finalObject } from "@commonplace/core";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(doc, links) {
  let hash = new Map();
  for (let i = 0; i < links.length; ++i) {
    hash.set(doc.links[i].hashableName(), { link: links[i] });
  }
  return RenderLinkFactory2(hash);
}

export function RenderLinkFactory2(linkMap) {
  let obj = {};

  function renderLinks() {
    let hash = makeLinkMap(linkMap);

    for (let [key, renderLink] of hash.entries()) {
      addModifiers(key, renderLink, hash);
    }
    
    return Array.from(hash.values());
  }

  function makeLinkMap(linkMap) {
    let hash = new Map();
    for (let [linkName, value] of linkMap) {
      if (value.link) {
        hash.set(linkName, RenderLink(value.link));
      }
    }
    return hash;
  }

  function addModifiers(key, renderLink, hash) {
    for(let [otherKey, candidate] of hash.entries()) {
      if (otherKey != key) {
        if (candidate.endsets.some(e => 
            e.pointers.some(p => p.pointerType === "link"
            && p.hashableName() === key))) {
          renderLink.modifiers.push(candidate);
        }
      }
    }
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
