import { addProperties, finalObject, memoize, listMap } from "@commonplace/utils";
import { AttributeValue } from "./attribute-value";
import { AttributeRoute } from "./AttributeRoute";

export function MarkupCalculation(parent, rules, objects) {
  let obj = {};

  function buildExpandedMarkup() {

    let linkTypeMap = listMap();
    let edlTypeMap = listMap();
    let clipTypeMap = listMap();

    rules.forEach(rule => {
      rule.linkTypes.forEach(type => linkTypeMap.push(type, rule));
      rule.edlTypes.forEach(type => edlTypeMap.push(type, rule));
      rule.clipTypes.forEach(type => clipTypeMap.push(type, rule));
    });

    let objectMap = new Map();

    function pushRule(rulesMap, rule, connection) {
      rule.attributeDescriptors.forEach(pair => {

        let route = undefined;
        if (connection == "target") {
          if (pair.inheritance == "direct") { route = AttributeRoute.immediateDirectTarget; }
          else { route = AttributeRoute.immediateContentTarget; }
        } else {
          if (pair.inheritance == "direct") { route = AttributeRoute.immediateDirectType; }
          else { route = AttributeRoute.immediateContentType; }
        }

        rulesMap.push(AttributeValue(
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

    objects.forEach(object => {
      let markupMap = listMap();
      objectMap.set(object.key, markupMap);
      
      let rules = object.incomingPointers.map(p => p.link.markupRule).filter(x => x);
      rules.forEach(rule => pushRule(markupMap, rule, "target"));

      if (object.isLink) {
        let rulesForType = linkTypeMap.get(object.type);
        rulesForType.forEach(rule => pushRule(markupMap, rule, "type"));
      }

      if (object.isEdl) {
        let rulesForType = edlTypeMap.get(object.type);
        rulesForType.forEach(rule => pushRule(markupMap, rule, "type"));
      }

      if (object.isClip) {
        let rulesForType = clipTypeMap.get(object.clipType);
        rulesForType.forEach(rule => pushRule(markupMap, rule, "type"));
      }

      let containers = object.seqences.length > 0 ? object.sequences : [parent];
      containers.forEach(container => {
        // TODO make sure the container's markup has been calculated first
        Object.entries(container.contentMarkup).forEach(([attribute, value]) => {
          // TODO how does this work with calculated markup? Do we used a calculated attribute
          // from the container or could we inherit the calculation itself? In which case, what
          // previous value is the calculation applied to?
          markupMap.set(attribute, AttributeValue(
            attribute,
            value,
            AttributeRoute.inheritedNonDefault,
            false,
            0,
            0
          ));
        });
      });

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

      Object.values(markupMap).forEach(values => {
        values.sort((a, b) => {
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? 1 : -1;
          } else if (a.attributeRoute !== b.attributeRoute) {
            return routeToOrder(a.attributeRoute) - routeToOrder(b.attributeRoute);
          } else if (a.linkDepth != b.linkDepth) {
            return a.linkDepth - b.linkDepth;
          }
          else { return a.linkIndex - b.linkIndex; }
        });
      });
    });
  }

  function calculateMarkup() {
    let expanded = obj.expandedMarkup();
    let markup = new Map();

    Object.values(expanded).forEach(values => {
      let head = values[0];
      markup.set(head.attributeName, head.AttributeValue);
    });

    return markup;
  }

  function calculateContentMarkup() {
    let expanded = obj.expandedMarkup();
    let markup = new Map();

    Object.values(expanded).forEach(values => {
      let head = values.find(value => value.isDefault == false
        && (value.attributeRoute == AttributeRoute.immediateContentTarget
          || value.attributeRoute == AttributeRoute.immediateContentType
          || value.attributeRoute == AttributeRoute.inheritedNonDefault));
      if (head) { markup.set(head.attributeName, head.AttributeValue); }
    });

    return markup;
  }

  addProperties(obj, {
    expandedMarkup: memoize(buildExpandedMarkup),
    markup: memoize(calculateMarkup),
    contentMarkup: memoize(calculateContentMarkup)
  });

  return finalObject(obj, {});
}
