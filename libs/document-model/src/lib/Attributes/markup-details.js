import { memoize } from "@commonplace/utils";

/**
 * Creates a MarkupDetails object that describes the fully resolved markup that applies to an object and its contents.
 * @param {Map} markupAttributeValues - The ListMap {key: attribute name, value: PotentialAttributeValues object}.
 * @returns {Object} - The MarkupDetails object.
 */
export function MarkupDetails(markupAttributeValues) {
  return {
    // A map {key: markup attribute, value: AttributeValues object}
    markupAttributeValues,
    
    // Memoized function to calculate and return the final markup for this object.
    markup: memoize(() => calculateMarkup(markupAttributeValues)),
    
    // Memoized function to calculate and return the markup for this object's content.
    contentMarkup: memoize(() => calculateContentMarkup(markupAttributeValues))
  };
}

/**
 * Calculates the final markup from the attribute values map.
 * @param {Map} markupAttributeValues - The map of attribute values.
 * @returns {Map} - The calculated markup.
 */
function calculateMarkup(markupAttributeValues) {
  let markup = new Map();

  for (var values of markupAttributeValues.values()) {
    let head = values[0];
    markup.set(head.attributeName, head.attributeValue);
  }

  return markup;
}

/**
 * Calculates the markup for content from the attribute values map.
 * @param {Map} markupAttributeValues - The map of attribute values.
 * @returns {Map} - The calculated content markup.
 */
function calculateContentMarkup(markupAttributeValues) {
  let markup = new Map();

  for (var values of markupAttributeValues.values()) {
    let head = values.find(value => value.isHeritable);
    if (head) {
      markup.set(head.attributeName, head.attributeValue);
    }
  }

  return markup;
}
