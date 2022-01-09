import { finalObject } from "@commonplace/core";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(doc, links) {
  let keyLinkPairs = [];
  for (let i = 0; i < links.length; ++i) {
    keyLinkPairs.push([doc.links[i].hashableName(), links[i]]);
  }
  return RenderLinkFactory2(keyLinkPairs);
}

export function RenderLinkFactory2(nameLinkPairs) {
  let obj = {};

  function renderLinks() {
    let nameRenderLinkPairs = makeNameRenderLinkPairs(nameLinkPairs);

    for (let [key, renderLink] of nameRenderLinkPairs) {
      addModifiers(key, renderLink, nameRenderLinkPairs);
    }
    
    return nameRenderLinkPairs.map(p => p[1]);
  }

  function makeNameRenderLinkPairs(linkMap) {
    return linkMap.filter(p => p[1]).map(p => [p[0], RenderLink(p[1])]);
  }

  function addModifiers(key, renderLink, nameRenderLinkPairs) {
    for(let [otherKey, candidate] of nameRenderLinkPairs) {
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
