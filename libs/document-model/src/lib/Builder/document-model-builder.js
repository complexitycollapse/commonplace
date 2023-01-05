import { finalObject, addProperties } from "@commonplace/utils";
import { ZettelSchneider2 } from "../Model/zettel-schneider-2";

export function DocumentModelBuilder(edlPointer, repo) {
  let obj = {};

  function build() {
    return buildRecursively(edlPointer, []);
  }

  function buildRecursively(edlPointer, inheritedLinks) {
    let model = {};
    let zettel = [];

    let edlPart = repo.getPartLocally(edlPointer);

    if (edlPart === undefined) {
      return {
        type: "missing EDL",
        zettel: [],
        links: [],
        groups: []
      };
    }

    let edl = edlPart.content;
    let linksList = edl.links.map(x => repo.getPartLocally(x)).filter(x => x).map(part => [part.pointer.hashableName, part.content]);
    let links = Object.fromEntries(linksList);

    let allLinks = inheritedLinks.concat(Object.values(links));

    edl.clips.forEach(c => {
      if (c.pointerType === "edl")
      {
        zettel.push(buildRecursively(c, allLinks));
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
