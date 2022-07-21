import { finalObject } from "@commonplace/utils";
import { RenderLink } from "./render-link";

export function RenderLinkFactory(edlZettel, links) {
  let obj = {};

  function renderLinks() {
    let renderLinks = makeRenderLinks(edlZettel, links);
    if (edlZettel.parent) {
      renderLinks = edlZettel.parent.renderLinks.concat(renderLinks);
    }

    renderLinks.forEach((renderLink) => {
      renderLink.allAllEdlRenderLinks(renderLinks);
    });
    
    return renderLinks;
  }

  return finalObject(obj, { renderLinks });
}

function makeRenderLinks(edlZettel, links) {
  let names = edlZettel.edl.links;
  return links.filter(x => x).map((link, i) => RenderLink(names[i], link, edlZettel));
}
