import { finalObject } from "@commonplace/core";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(doc, links) {
  let obj = {};

  function renderLinks() {
    let renderLinks = links.map(l => RenderLink(l));
    let hash = makeLinkMap(renderLinks);

    for (let [key, renderLink] of hash.entries()) {
      addModifiers(key, renderLink, hash);
    }
    
    return renderLinks;
  }

  function makeLinkMap(renderLinks) {
    let hash = new Map();
    for (let i = 0; i < renderLinks.length; ++i) {
      hash.set(makeKey(doc.links[i]), renderLinks[i]);
    }
    return hash;
  }

  function makeKey(linkPointer) {
    return linkPointer.name + "/" + (linkPointer.index === undefined ? "N" : linkPointer.index.toString());
  }

  function addModifiers(key, renderLink, hash) {
    for(let [otherKey, candidate] of hash.entries()) {
      if (otherKey != key) {
        if (candidate.endsets.some(e => e.pointers.some(p => p.pointerType === "link" && makeKey(p) === key))) {
          renderLink.modifiers.push(candidate);
        }
      }
    }
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
