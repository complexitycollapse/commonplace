import { finalObject, addMethods } from "@commonplace/core";
import { Node } from "./node";

export function TreeBuilder(zettel, renderLinks) {
  let remaining = [...zettel];

  let obj = {};

  function build() {
    return Node();
  }

  return finalObject(obj, {
    build
  });
}
