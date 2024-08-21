import { addProperties, finalObject } from "@commonplace/utils";

/**
 * Constructs an PotentialAttributeValue object that represents a potential markup attribute 
 * value an object may receive. It contains the attribute value being assigned, the rule that 
 * assigns it (or undefined if it is inherited from a container), and information from which the 
 * priority of this assignment can be calculated, which allows conflicting values to be resolved.
 * 
 * @param {string} attributeName - The name of the attribute.
 * @param {*} attributeValue - The value of the attribute.
 * @param {string} attributeInheritance - Whether the attribute is configured to be direct or content.
 * @param {string} matchResult - The match explanation returned by Rule.match.
 * @param {Object} origin - The rule that assigns this attribute value to the target, or undefined 
 * if it is inherited.
 * @returns {Object} - The constructed PotentialAttributeValue object.
 */

export function PotentialAttributeValue(attributeName, attributeValue, attributeInheritance, inherited, matchResult, origin) {
  
  let obj = {};
  let attributeRoute = calculateRoute(inherited, attributeInheritance, matchResult);
  let isHeritable = attributeRoute == AttributeRoute.immediateContentTarget ||
    attributeRoute == AttributeRoute.immediateContentType ||
    attributeRoute == AttributeRoute.inheritedNonDefault;

  addProperties(obj, {
    attributeName,
    attributeValue,
    attributeInheritance, // direct only or content also?
    attributeRoute,
    isHeritable, // should children inherit this attribute? Only true if for content attributes that are not inherited via a class (TODO: why?)
    matchResult,
    origin
  });

  // Sorting the values by priority, from most significant factor to least:
  // 1. Non-defaults preferred to defaults
  // 2. High priority routes preferred over low priority routes
  // 3. Inner links preferred over outer links
  // 4. Links later in the EDL preferred to those earlier
  function compareValuePriority(b) {
    if (origin.originLink.isDefault !== b.origin.originLink.isDefault) {
      return origin.originLink.isDefault ? 1 : -1;
    } else if (obj.attributeRoute !== b.attributeRoute) {
      return routeToOrder(obj.attributeRoute) - routeToOrder(b.attributeRoute);
    } else if (origin.originLink.depth != b.origin.originLink.depth) {
      return origin.originLink.depth - b.origin.originLink.depth;
    }
    else { return b.origin.originLink.index - origin.originLink.index; }
  }

  return finalObject(obj, {
    compareValuePriority
  });
}

// Helper functions

function calculateRoute(inherited, attributeInheritance, matchResult) {
  if (inherited) {
    return AttributeRoute.inheritedNonDefault;
  }

  if (matchResult == "named") {
    return attributeInheritance == "direct" ? AttributeRoute.immediateDirectTarget : AttributeRoute.immediateContentTarget;
  }
  
  if (matchResult == "class") {
    return attributeInheritance == "direct" ? AttributeRoute.immediateDirectClass : AttributeRoute.immediateContentClass;
  }
  
  if (matchResult == "class and type") {
    return attributeInheritance == "direct" ? AttributeRoute.immediateDirectClassAndType : AttributeRoute.immediateContentClassAndType;
  }

  return attributeInheritance == "direct" ? AttributeRoute.immediateDirectType : AttributeRoute.immediateContentType;
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

const AttributeRoute = {
  /*
  Immeditate = not inherited
  Direct = the attribute only applies to the target
  Content = the attribute applies to the target and its content
  Target = the target is named specifically by the rule
  Class & Type = the rule specified a target and a type
  etc.
*/
  immediateDirectTarget: "Immediate Direct Target",
  immediateContentTarget: "Immediate Content Target",
  immediateDirectClassAndType: "Immediate Direct Class And Type",
  immediateContentClassAndType: "Immediate Content Class And Type",
  immediateDirectClass: "Immediate Direct Class",
  immediateContentClass: "Immediate Content Class",
  immediateDirectType: "Immediate Direct Type",
  immediateContentType: "Immediate Content Type",
  inheritedNonDefault: "Inherited Non Default"
  // There is no such thing as an inherited default.
};

Object.freeze(AttributeRoute);
