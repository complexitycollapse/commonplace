import { finalObject } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderLink } from "./render-link";
import { RenderPointer } from "./render-pointer";

export function RenderLinkFactory(edlZettel) {
  let obj = {};

  function renderLinks() {
    let nameRenderLinkPairs = makeNameRenderLinkPairs(edlZettel.nameLinkPairs());

    Object.entries(nameRenderLinkPairs).forEach(([key, renderLink]) => {
      addModifiers(key, renderLink, nameRenderLinkPairs);
    });
    
    return nameRenderLinkPairs;
  }

  function makeNameRenderLinkPairs(linkMap) {
    let renderLinks = {};
    linkMap.filter(p => p[1]).forEach(p => renderLinks[p[0]] = RenderLink(p[1], edlZettel));
    return renderLinks;
  }

  function addModifiers(key, renderLink, renderLinksByName) {
    Object.entries(renderLinksByName).forEach(([otherKey, otherRenderLink]) => {
      if (otherKey != key) {
        otherRenderLink.endsets.forEach(e => {
          e.pointers.forEach(p => {
            if (p.pointerType === "link" && p.hashableName === key) {
              renderLink.modifiers.push(RenderPointer(p, RenderEndset(e, otherRenderLink)));
            }
          });
        });
      }
    });
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
