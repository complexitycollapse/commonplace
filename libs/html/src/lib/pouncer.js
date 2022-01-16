import { finalObject, RenderDocument } from "@commonplace/core";

export function Pouncer(repository) {
  let obj = {};

  async function fetchDoc(docPointer) {
    let doc = (await repository.getPart(docPointer)).content;
    let nameLinkPairs = [];
    await repository.getManyParts(doc.links.map(l => [l, lp => nameLinkPairs.push([l, lp.content])]));
    let renderDoc = RenderDocument(doc);
    nameLinkPairs.forEach(nlp => renderDoc.resolveLink(nlp[0], nlp[1]));
    let tree =  renderDoc.zettelTree();
    repository.getManyParts(tree.outstandingRequests());

    return tree;
  }

  return finalObject(obj, {
    fetchDoc
  });
}
