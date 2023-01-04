import { finalObject, addProperties } from "@commonplace/utils";
import { ZettelSchneider2 } from "../Model/zettel-schneider-2";

export function DocumentModelBuilder(doc, repo) {
  let obj = {};

  function build() {
    let model = {};
    let zettel = [];

    let linksList = doc.links.map(x => repo.getPartLocally(x)).filter(x => x).map(part => [part.pointer.hashableName, part.content]);
    let links = Object.fromEntries(linksList);

    doc.clips.forEach(c => {
      let z = ZettelSchneider2(c, Object.values(links)).zettel();
      zettel = zettel.concat(z);
    });

    addProperties(model, {
      zettel,
      links,
      groups: []
    });

    return finalObject(model, {});
  }

  return finalObject(obj, { build });
}
