import { finalObject, memoize, listMap } from "@commonplace/utils";
import { AttributeValue } from "./attribute-value";
import { AttributeRoute } from "./attribute-route";
import { compareLinkPriority } from "../link-priority";

export function MarkupCalculation(edl, rules, objects, parentMap) {
  let obj = {};
  let objectMap = new Map(parentMap);

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

      // Sort links by priority
      for (let values of markupMap.values()) {
        values.sort(compareLinkPriority);
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
