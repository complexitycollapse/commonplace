import { finalObject, memoize, listMap } from "@commonplace/utils";
import { AttributeValue } from "./attribute-value";
import { AttributeRoute } from "./AttributeRoute";

export function MarkupCalculation(edl, rules, objects) {
  let obj = {};
  let objectMap = new Map();

  function populateObjectMap() {
    let [linkTypeMap, edlTypeMap, clipTypeMap] = buildTypeMaps(rules);

    function createMarkupForObject(object) {
      // Only process each object once.
      if (objectMap.has(object.key)) { return objectMap.get(object.key); }

      let markupMap = listMap();
      let markup = {
        expandedMarkup: markupMap,
        markup: memoize(() => calculateMarkup(markupMap)),
        contentMarkup: memoize(() => calculateContentMarkup(markupMap))
      };
      objectMap.set(object.key, markup);

      // Add all rules that target the object directly.
      let rules = object.incomingPointers.map(p => p.link.markupRule).filter(x => x);
      rules.forEach(rule => pushRule(markupMap, rule, "target"));

      // Add rules that target the type of this object.

      if (object.isLink) {
        let rulesForType = linkTypeMap.get(object.type);
        rulesForType.forEach(rule => pushRule(markupMap, rule, "type"));
      }

      if (object.isEdl) {
        let rulesForType = edlTypeMap.get(object.type);
        rulesForType.forEach(rule => pushRule(markupMap, rule, "type"));
      }

      if (object.isClip) {
        let rulesForType = clipTypeMap.get(object.pointer.pointerType);
        rulesForType.forEach(rule => pushRule(markupMap, rule, "type"));
      }

      // Add any attributes inherited from the object's containers.

      function addContentValueFromContainer(container) {
        if (container === undefined) { return container; }

        // If the container has not had its markupMap created yet, do it now.
        let containerMarkup = createMarkupForObject(container);
        let contentMarkup = containerMarkup.contentMarkup();

        for (var [attribute, value] of contentMarkup.entries()) {
          // TODO how does this work with calculated markup? Do we used a calculated attribute
          // from the container or could we inherit the calculation itself? In which case, what
          // previous value is the calculation applied to?
          markupMap.push(attribute, AttributeValue(
            attribute,
            value,
            AttributeRoute.inheritedNonDefault,
            false,
            0,
            0
          ));
        }
      }

      if (object === edl) {
        addContentValueFromContainer(edl.parent);
      } else if (object.sequences.length > 0) {
        object.sequences.forEach(sequence => addContentValueFromContainer(sequence.definingLink));
      } else {
        addContentValueFromContainer(edl);
      }

      function routeToOrder(route) {
        switch (route) {
          case AttributeRoute.immediateDirectTarget:
            return 1;
          case AttributeRoute.immediateContentTarget:
            return 2;
          case AttributeRoute.immediateDirectType:
            return 3;
          case AttributeRoute.immediateContentType:
            return 4;
          case AttributeRoute.inheritedNonDefault:
            return 5;
          default:
            // This is an error so relegate it to the bottom
            return 6;
        }
      }

      // Sorting the values by priority, from most significant factor to least:
      // 1. Non-defaults preferred to defaults
      // 2. High priority routes preferred over low priority routes
      // 3. Inner links preferred over outer links
      // 4. Links later in the EDL preferred to those earlier
      for (let values of markupMap.values()) {
        values.sort((a, b) => {
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? 1 : -1;
          } else if (a.attributeRoute !== b.attributeRoute) {
            return routeToOrder(a.attributeRoute) - routeToOrder(b.attributeRoute);
          } else if (a.linkDepth != b.linkDepth) {
            return a.linkDepth - b.linkDepth;
          }
          else { return b.linkIndex - a.linkIndex; }
        });
      }

      return markup;
    }

    objects.forEach(createMarkupForObject);
    return objectMap;
  }

  function calculateMarkup(markupMap) {
    let markup = new Map();

    for (var values of markupMap.values()) {
      let head = values[0];
      markup.set(head.attributeName, head.attributeValue);
    }

    return markup;
  }

  function calculateContentMarkup(markupMap) {
    let markup = new Map();

    for (var values of markupMap.values()) {
      let head = values.find(value =>
        value.attributeRoute == AttributeRoute.immediateContentTarget
        || value.attributeRoute == AttributeRoute.immediateContentType
        || value.attributeRoute == AttributeRoute.inheritedNonDefault);
      if (head) { markup.set(head.attributeName, head.attributeValue); }
    }

    return markup;
  }

  return finalObject(obj, {
    initialize: populateObjectMap
  });
}

function buildTypeMaps(rules) {
  let linkTypeMap = listMap();
  let edlTypeMap = listMap();
  let clipTypeMap = listMap();

  rules.forEach(rule => {
    rule.linkTypes.forEach(type => linkTypeMap.push(type, rule));
    rule.edlTypes.forEach(type => edlTypeMap.push(type, rule));
    rule.clipTypes.forEach(type => clipTypeMap.push(type, rule));
  });

  return [linkTypeMap, edlTypeMap, clipTypeMap];
}

function pushRule(markupMap, rule, connection) {
  rule.attributeDescriptors.forEach(pair => {

    let route = undefined;
    if (connection == "target") {
      if (pair.inheritance == "direct") { route = AttributeRoute.immediateDirectTarget; }
      else { route = AttributeRoute.immediateContentTarget; }
    } else {
      if (pair.inheritance == "direct") { route = AttributeRoute.immediateDirectType; }
      else { route = AttributeRoute.immediateContentType; }
    }

    markupMap.push(pair.attribute,
      AttributeValue(
        pair.attribute,
        pair.value,
        route,
        rule.isDefault,
        rule.originLink.depth,
        rule.originLink.index,
        rule
    ));
  });
}
