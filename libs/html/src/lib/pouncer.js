import { finalObject } from "@commonplace/core";
import { RenderDocument } from "./render-document";

export function Pouncer(repository) {
  let obj = {};

  async function fetchDoc(docPointer) {
    let doc = (await repository.getPart(docPointer)).content;
    let linkParts = (await repository.getManyParts(doc.links));
    let renderDoc = RenderDocument(doc);
    linkParts.forEach((l, i) => renderDoc.resolveLink(doc.links[i], l.content));
    let tree =  renderDoc.zettelTree();

    let parts = await repository.getManyParts(doc.clips);
    parts.forEach(part => renderDoc.resolvePart(part));

    return tree;
  }

  return finalObject(obj, {
    fetchDoc
  });
}
