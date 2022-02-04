import { finalObject } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderLink } from "./render-link";
import { RenderPointer } from "./render-pointer";

export function RenderLinkFactory(edlZettel) {
  let obj = {};

  function renderLinks() {
    let renderLinks = makeRenderLinks(edlZettel.nameLinkPairs());

    renderLinks.forEach((renderLink) => {
      addModifiers(renderLink.pointer, renderLink, renderLinks);
    });
    
    return renderLinks;
  }

  function makeRenderLinks(nameLinkPairs) {
    let renderLinks = nameLinkPairs.filter(p => p[1]).map(p => RenderLink(p[0], p[1], edlZettel));
    return renderLinks;
  }

  function addModifiers(linkName, renderLink, renderLinks) {
    renderLinks.forEach((otherRenderLink) => {
      if (otherRenderLink.pointer.hashableName != linkName.hashableName) {
        otherRenderLink.endsets.forEach(e => {
          e.pointers.forEach(p => {
            renderLink.modifiers.tryAdd(RenderPointer(p, RenderEndset(e, otherRenderLink)));
          });
        });
      }
    });
    return renderLink;
  }

  return finalObject(obj, { renderLinks });
}
