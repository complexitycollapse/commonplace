import { finalObject } from "../utils";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(nameLinkPairs) {
  let obj = {};

  function renderLinks() {
    let nameRenderLinkPairs = makeNameRenderLinkPairs(nameLinkPairs);

    Object.entries(nameRenderLinkPairs).forEach(([key, renderLink]) => {
      addModifiers(key, renderLink, nameRenderLinkPairs);
    });
    
    return nameRenderLinkPairs;
  }

  function makeNameRenderLinkPairs(linkMap) {
    let renderLinks = {};
    linkMap.filter(p => p[1]).forEach(p => renderLinks[p[0]] = RenderLink(p[1]));
    return renderLinks;
  }

  function addModifiers(key, renderLink, nameRenderLinkPairs) {
    Object.entries(nameRenderLinkPairs).forEach(([otherKey, candidate]) => {
      if (otherKey != key) {
        if (candidate.endsets.some(e => 
            e.pointers.some(p => p.pointerType === "link"
            && p.hashableName() === key))) {
          renderLink.modifiers.push(candidate);
        }
      }
    });
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
