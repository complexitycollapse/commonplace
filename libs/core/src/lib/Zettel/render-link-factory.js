import { finalObject } from "../utils";
import { RenderEndset } from "./render-endset";
import { RenderLink } from "./render-link";
import { RenderPointer } from "./render-pointer";

export function RenderLinkFactory(edlZettel) {
  let obj = {};

  function renderLinks() {
    let nameRenderLinkPairs = makeNameRenderLinkPairs(edlZettel.nameLinkPairs());

    nameRenderLinkPairs.forEach(([linkName, renderLink]) => {
      addModifiers(linkName, renderLink, nameRenderLinkPairs);
    });
    
    return nameRenderLinkPairs;
  }

  function makeNameRenderLinkPairs(nameLinkPairs) {
    let renderLinks = nameLinkPairs.filter(p => p[1]).map(p => [p[0], RenderLink(p[1], edlZettel)]);
    return renderLinks;
  }

  function addModifiers(linkName, renderLink, renderLinksByName) {
    renderLinksByName.forEach(([otherLinkName, otherRenderLink]) => {
      if (otherLinkName.hashableName != linkName.hashableName) {
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
