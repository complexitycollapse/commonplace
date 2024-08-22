import { finalObject, ListMap } from "@commonplace/utils";
import { PotentialAttributeValue } from "./potential-attribute-value.js";
import { MarkupDetails } from "./markup-details.js";

/*
  How the Markup Algorithm Works

  Iterate through all the objects, and for each one find all the rules that apply to it and all 
  content attributes possessed by its parents. Construct a LispMap of attribute names to lists 
  of PotentialAttributeValue objects, each one representing a value assigned to the attribute 
  by a particular rule or parent. Then use prioritization rules to sort each list of 
  PotentialAttributeValue objects. Finally, create a MarkupDetails object to hold all the lists 
  for the object.

  The result is returned as a ListMap, mapping each object key to its MarkupDetails object. Each 
  MarkupDetails in turn contains the priority sorted lists of PotentialAttributeValue objects. 
  MarkupDetails will also calculate the final values for each attribute.

  Calculating the PotentialAttributeValue objects for an object requires also calculating the 
  MarkupDetails for its containers (so we know what the inherited content values are). So one 
  calculation triggers other calculations which must complete first.
*/


/**
 * Constructs a MarkupMapBuilder object that will build the markup map for requested objects in
 * an EdlModel. The markup map has format {key: object.key, value: MarkupDetails object}.
 * @param {Object} edl - The EdlModel that contains the objects.
 * @param {Array} rules - The list of markup rules to apply.
 * @param {Array} objects - The list of objects in the Edl to process.
 * @param {Map} parentMap - The markup map of the parent Edl, or undefined if there is no parent.
 * @returns {Object} - The constructed MarkupMapBuilder object.
 */
export function MarkupMapBuilder(edl, rules, objects, parentMap) {
  let obj = {};
  parentMap = parentMap ?? new Map();

  /**
   * Creates the markup map with MarkupDetails for each object.
   * @returns {Map} - The markup map.
   */
  function getMarkupMap() {
    let markupMap = new Map(parentMap);

    /**
     * Creates MarkupDetails for a given object.
     * @param {Object} object - The object to create markup for.
     * @returns {Object} - The created MarkupDetails for the object.
     */
    function createMarkupDetailsForObject(object) {
      // Only process each object once.
      if (markupMap.has(object.key)) {
        return markupMap.get(object.key);
      }

      let markupAttributeValues = ListMap();
      // Create and add the MarkupDetails now. This prevents loops when the hierarchy
      // is searched.
      let markup = MarkupDetails(markupAttributeValues);
      markupMap.set(object.key, markup);

      rules.forEach(rule => {
        let matchResult = rule.match(object);
        if (matchResult) {
          pushAttributeValue(markupAttributeValues, rule, matchResult);
        }
      });

      // Add any attributes inherited from the object's containers.
      function addContentValueFromContainer(container) {
        if (container === undefined) {
          return container;
        }

        // If the container has not had its markupAttributeValues created yet, do it now.
        let containerMarkup = createMarkupDetailsForObject(container);
        let contentMarkup = containerMarkup.winningContentAttributeValues();

        for (var av of contentMarkup) {
          // TODO how does this work with calculated markup? Do we use a calculated attribute
          // from the container or could we inherit the calculation itself? In which case, what
          // previous value is the calculation applied to?
          markupAttributeValues.push(av.attributeName, PotentialAttributeValue(av.attributeName, av.attributeValue, "content", true, av.matchResult, av.origin));
        }
      }

      // Handle inheritance of content values from containers.
      if (object === edl) {
        addContentValueFromContainer(edl.parent);
      } else {
        addContentValueFromContainer(edl);
      }
      object.sequences.forEach(sequence => addContentValueFromContainer(sequence.definingLink));

      // Sort values by priority
      for (let values of markupAttributeValues.values()) {
        values.sort((a, b) => a.compareValuePriority(b));
      }

      return markup;
    }

    // Process each object to create its markup.
    objects.forEach(createMarkupDetailsForObject);
    return markupMap;
  }

  // Return the final object with the initialize function included.
  return finalObject(obj, {
    getMarkupMap
  });
}

/**
 * Pushes the attributes endowed by a rule onto the markup map.
 * @param {Map} markupAttributes - The map to push the rule onto.
 * @param {Object} rule - The rule to push.
 * @param {string} connection - The type of connection ("named", "type" or undefined).
 */
function pushAttributeValue(markupAttributes, rule, matchResult) {
  rule.attributeDescriptors.forEach(descriptor => {
    // Push the attribute value onto the markup map.
    markupAttributes.push(descriptor.attribute,
      PotentialAttributeValue(
        descriptor.attribute,
        descriptor.value,
        descriptor.inheritance,
        false,
        matchResult,
        rule
    ));
  });
}
