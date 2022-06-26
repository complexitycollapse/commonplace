import { finalObject } from "@commonplace/utils";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(edlZettel) {
  let obj = {};

  function renderLinks() {
    let renderLinks = makeRenderLinks(edlZettel);
    if (edlZettel.parent) {
      renderLinks = renderLinks.concat(edlZettel.parent.renderLinks);
    }

    renderLinks.forEach((renderLink) => {
      renderLink.modifiers.tryAddAll(renderLinks);
    });
    
    return renderLinks;
  }

  return finalObject(obj, { renderLinks });
}

function makeRenderLinks(edlZettel) {
  let nameLinkPairs = edlZettel.nameLinkPairs;
  let renderLinks = nameLinkPairs.filter(p => p[1]).map(p => RenderLink(p[0], p[1], edlZettel));
  return renderLinks;
}
