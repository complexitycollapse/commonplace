import { finalObject } from "..";
import { Doc } from "./doc";
import { RegionBuilder } from "./region-builder";
import { RenderLinkFactory2 } from "./render-link-factory";
import { ManyZettelSchneider } from "./zettel-schneider";

export function RenderDocument(doc) {
  doc = doc ?? Doc();
  let obj = {};
  let linkMap = new Map(doc.links.map(l => [l.hashableName(), { pointer: l, link: undefined}]));
  let renderLinkCache = undefined, zettelTreeCache = undefined, zettelCache = undefined;

  function outstandingLinks() {
    return linkMap.values().filter(x => x.link === undefined).map(x => x.pointer);
  }

  function resolveLink(linkPointer, link) {
    linkMap.get(linkPointer.hashableName()).link = link;
    renderLinkCache = undefined;
    zettelCache = undefined;
    zettelTreeCache = undefined;
  }

  function resolvePart(part) {
    let zs = zettel();
    zs.forEach(z => z.tryAddPart(part));
  }

  function ensureRenderLinks() {
    if (renderLinkCache === undefined) {
      let nameLinkPairs = Array.from(linkMap.entries(), pair => [pair[0], pair[1].link]);
      renderLinkCache = RenderLinkFactory2(nameLinkPairs).renderLinks();
    }
    return renderLinkCache;
  }

  function zettel() {
    if (zettelCache === undefined) {
      let renderLinks = ensureRenderLinks();
      zettelCache = ManyZettelSchneider(doc.clips, renderLinks).zettel();
    }
    return zettelCache;
  }

  function zettelTree() {
    if (zettelTreeCache === undefined) {
      let zs = zettel();
      zettelTreeCache =  RegionBuilder(zs).build();
    }
    return zettelTreeCache;
  }

  return finalObject(obj, {
    outstandingLinks,
    resolveLink,
    zettelTree,
    resolvePart
  });
}
