import { addMethods, addProperties } from "@commonplace/core";
import { objHasModifiedEndset, endsetsInObjButNotInOther, sharedEndsets } from "./zettel";

export function Node(endsets) {
  let obj = { children: [] };

  addProperties(obj, {
    endsets
  });

  addMethods(obj, {
    hasModifiedEndset: e => objHasModifiedEndset(obj, e),
    endsetsNotInOther: other => endsetsInObjButNotInOther(obj, other),
    sharedEndsets: n => sharedEndsets(obj, n)
  });

  return obj;
}
