import { finalObject } from "@commonplace/utils";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(edlZettel, links) {
  let obj = {};

  function renderLinks() {
    let renderLinks = makeRenderLinks(edlZettel, links);
    if (edlZettel.parent) {
      renderLinks = renderLinks.concat(edlZettel.parent.renderLinks);
    }

    renderLinks.forEach((renderLink) => {
      renderLink.tryAddAll(renderLinks);
    });
    
    return renderLinks;
  }

  return finalObject(obj, { renderLinks });
}

function makeRenderLinks(edlZettel, links) {
  let names = edlZettel.edl.links;
  return links.filter(x => x).map((link, i) => RenderLink(names[i], link, edlZettel));
}
