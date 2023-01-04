import { finalObject, addProperties } from "@commonplace/utils";

export function DocumentModelBuilder(doc, repo) {
  let obj = {};

  function build() {
    let model = {};

    let linksList = doc.links.map(x => repo.getPartLocally(x)).filter(x => x).map(part => [part.pointer.hashableName, part.content]);
    let links = Object.fromEntries(linksList);

    addProperties(model, {
      zettel: [],
      links,
      groups: []
    });

    return finalObject(model, {});
  }

  return finalObject(obj, { build });
}
