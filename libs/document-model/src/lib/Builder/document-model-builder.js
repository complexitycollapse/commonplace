import { finalObject, addProperties } from "@commonplace/utils";
import { Edl } from "@commonplace/core";
import { ZettelSchneider2 } from "../Model/zettel-schneider-2";

export function DocumentModelBuilder(edl, repo) {
  let obj = {};

  function build() {
    return buildRecursively(edl, []);
  }

  function buildRecursively(edl, inheritedLinks) {
    let model = {};
    let zettel = [];

    let linksList = edl.links.map(x => repo.getPartLocally(x)).filter(x => x).map(part => [part.pointer.hashableName, part.content]);
    let links = Object.fromEntries(linksList);

    let allLinks = inheritedLinks.concat(Object.values(links));

    edl.clips.forEach(c => {
      if (c.pointerType === "edl")
      {
        let childEdl = repo.getPartLocally(c) ?? Edl("missing EDL", [], []);
        zettel.push(buildRecursively(childEdl.content, allLinks));
      } else {
        let z = ZettelSchneider2(c, allLinks).zettel();
        zettel = zettel.concat(z);
      }
    });

    addProperties(model, {
      type: edl.type,
      zettel,
      links,
      groups: []
    });

    return finalObject(model, {});
  }

  return finalObject(obj, { build });
}
