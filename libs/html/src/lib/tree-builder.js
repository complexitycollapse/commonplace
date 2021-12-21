import { finalObject } from "@commonplace/core";

export function TreeBuilder(zettel) {
  let remaining = [...zettel];

  let obj = {};

  function build() {
    return undefined;
  }

  return finalObject(obj, {
    build
  });
}
