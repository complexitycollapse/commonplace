import { finalObject } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderLink } from "./render-link";
import { RenderPointer } from "./render-pointer";

export function RenderLinkFactory(edlZettel) {
  let obj = {};

  function renderLinks() {
    let nameRenderLinkPairs = makeNameRenderLinkPairs(edlZettel.nameLinkPairs());

    Object.entries(nameRenderLinkPairs).forEach(([linkName, renderLink]) => {
      addModifiers(linkName, renderLink, nameRenderLinkPairs);
    });
    
    return nameRenderLinkPairs;
  }

  function makeNameRenderLinkPairs(linkMap) {
    let renderLinks = {};
    linkMap.filter(p => p[1]).forEach(p => renderLinks[p[0]] = RenderLink(p[1], edlZettel));
    return renderLinks;
  }

  function addModifiers(linkName, renderLink, renderLinksByName) {
    Object.entries(renderLinksByName).forEach(([otherLinkName, otherRenderLink]) => {
      if (otherLinkName != linkName) {
        otherRenderLink.endsets.forEach(e => {
          e.pointers.forEach(p => {
            if (p.pointerType === "link" && p.hashableName === linkName) {
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
