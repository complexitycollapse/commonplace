import { finalObject } from "@commonplace/core";
import { Node } from "./node";

export function TreeBuilder(zettel) {
  let remaining = [...zettel];

  let obj = {};

  function build() {
    if (remaining.length === 0) { return Node([]); }
    return descend(undefined);
  }

  function descend(limits) {
    let node = Node([...(remaining[0].structuralEndsets)]);
    return gobble(limits, node);
  }

  function ascend(child, limits) {
    let nodeEndsets = child.sharedEndsets(remaining[0], true);
    let node = Node(nodeEndsets);
    node.children.push(child);
    return gobble(limits, node);
  }

  function gobble(limits, node) {
    for (let next = remaining[0]; remaining.length !== 0; next = remaining[0]) {
      
      // The next zettel breaks the limits of this one
      if (limits) {
        if (limits.endsetsNotInOther(next, true).length > 0 || 
        limits.sameEndsets(next, true)) {
          return node;
        }
      }

      // The next zettel needs to belong to the parent node
      if (node.endsetsNotInOther(next, true).length > 0) {
        return ascend(node, limits);
      }

      // The next zettel needs to belong to a child
      if (next.endsetsNotInOther(node, true).length > 0) {
        node.children.push(descend(node));
      } else {
        // The next zettel should be added to this node
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
