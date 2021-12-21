import { finalObject, addMethods } from "@commonplace/core";
import { Node } from "./node";

export function TreeBuilder(zettel, renderLinks) {
  let remaining = [...zettel];

  let obj = {};

  function build() {
    if (remaining.length === 0) { return Node(); }
    return descend(Node([]));
  }

  function descend(limits) {
    let node = Node([...(remaining[0].endsets)]);
    return gobble(limits, node);
  }

  function ascend(child, limits) {
    let node = Node([...(remaining[0])]);
    node.children.push(child);
    return gobble(limits, node);
  }

  function gobble(limits, node) {
    for (let next = remaining[0]; remaining.length !== 0; next = remaining[0]) {
      
      // The next zettel breaks the limits of this one
      if (limits.endsetsNotInOther(next).length > 0) {
        return node;
      }

      // The next zettel needs to belong to the parent node
      if (node.endsetsNotInOther(next).length > 0) {
        return ascend(node, limits);
      }

      // The next zettel needs to belong to a child
      if (next.endsetsNotInOther(node).length > 0) {
        node.children.push(descend(node));
      } else {
        node.children.push(next);
        remaining.shift();
      }
    }

    return node;  
  }

  return finalObject(obj, {
    build
  });
}
