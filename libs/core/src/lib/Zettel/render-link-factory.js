import { finalObject } from "../utils";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(nameLinkPairs) {
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
