import { AttributeRoute } from "./Attributes/attribute-route";

// Sorting the values by priority, from most significant factor to least:
// 1. Non-defaults preferred to defaults
// 2. High priority routes preferred over low priority routes
// 3. Inner links preferred over outer links
// 4. Links later in the EDL preferred to those earlier
export function compareLinkPriority(a, b) {
  if (a.isDefault !== b.isDefault) {
    return a.isDefault ? 1 : -1;
  } else if (a.attributeRoute !== b.attributeRoute) {
    return routeToOrder(a.attributeRoute) - routeToOrder(b.attributeRoute);
  } else if (a.linkDepth != b.linkDepth) {
    return a.linkDepth - b.linkDepth;
  }
  else { return b.linkIndex - a.linkIndex; }
}

function routeToOrder(route) {
  switch (route) {
    case AttributeRoute.immediateDirectTarget:
      return 1;
    case AttributeRoute.immediateContentTarget:
      return 2;
    case AttributeRoute.immediateDirectClassAndType:
      return 3;
    case AttributeRoute.immediateContentClassAndType:
      return 4;
    case AttributeRoute.immediateDirectClass:
      return 5;
    case AttributeRoute.immediateContentClass:
      return 6;
    case AttributeRoute.immediateDirectType:
      return 7;
    case AttributeRoute.immediateContentType:
      return 8;
    case AttributeRoute.inheritedNonDefault:
      return 9;
    default:
      // This is an error so relegate it to the bottom
      return 8;
  }
}
