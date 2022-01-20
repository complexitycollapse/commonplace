import { finalObject } from "../utils";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(nameLinkPairs) {
  let obj = {};

  function renderLinks() {
    let nameRenderLinkPairs = makeNameRenderLinkPairs(nameLinkPairs);

    Object.keys(nameRenderLinkPairs).forEach(key => {
      addModifiers(key, nameRenderLinkPairs[key], nameRenderLinkPairs);
    });
    
    return nameRenderLinkPairs;
  }

  function makeNameRenderLinkPairs(linkMap) {
    let renderLinks = {};
    linkMap.filter(p => p[1]).forEach(p => renderLinks[p[0]] = RenderLink(p[1]));
    return renderLinks;
  }

  function addModifiers(key, renderLink, nameRenderLinkPairs) {
    Object.keys(nameRenderLinkPairs).forEach(otherKey => {
      let candidate = nameRenderLinkPairs[otherKey];
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
