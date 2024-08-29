import { addProperties, finalObject } from "@commonplace/utils";
import { getContainerLevelsAsMaps } from "../class-mixins";

/*
  A rule matches the target if any of the following are true:
  
  1. The target is mentioned specifically in the list of namedTargets.
  2. The rule specifies classes but no types, and the target matches at least one of those classes.
  3. The rule specifies types but not classes, and the target matches one of those types.
  4. The rule specifies classes AND types, and the target matches at least one class and one type.
*/

/**
 * Constructs a Rule object, representing a set of criteria which can be matched against
 * a link, clip or Edl; and attributes that the matching object gains by matching the rule.
 * Example use: creating a markup rule that endows markup attributes to certain objects.
 * @param {Object} originLink - The link that defines the rule.
 * @param {Array} namedTargets - Specific named objects that match the rule.
 * @param {Array} classes - Classes to be matched.
 * @param {Array} linkTypes - Link types to be matched.
 * @param {Array} clipTypes - Clip types to be matched.
 * @param {Array} edlTypes - Edl types to be matched.
 * @param {Object} attributeDescriptors - Attributes endowed to the objects that match this rule.
 * @returns {Object} - The constructed Rule object.
 */
export function Rule(originLink, namedTargets, classes, linkTypes, clipTypes, edlTypes, levels, attributeDescriptors) {
  let obj = {};

  // Determine if there are any type or class criteria
  let hasTypeCriteria = linkTypes.length > 0 || clipTypes.length > 0 || edlTypes.length > 0;
  let hasClassCriteria = classes.length > 0;

  // Add properties to the rule object
  addProperties(obj, {
    originLink,
    attributeDescriptors,
    namedTargets,
    linkTypes,
    clipTypes,
    edlTypes,
    classes,
    levels,
    hasTypeCriteria,
    hasClassCriteria
  });

  /**
   * Checks if the target matches the criteria defined by the rule.
   * @param {Object} target - The target to be matched (clip, link or Edl).
   * @returns {boolean} - A string describing the criteria that matched, or undefined if there was no match.
   */
  function match(target) {
    // Check that the target is within the rule's level scope.
    const levelResult = withinLevelScope(target, levels);
    if (levelResult === undefined) { return; }
    
    const levelScopeDistance = Number.isInteger(levelResult) ? levelResult : undefined;
    const specificity = calculateSpecificity(target);

    if (specificity) { return { specificity, levelScopeDistance }; }

    return;
  }

  function calculateSpecificity(target) {
    // Check if any immediate target endows to the target pointer
    if (namedTargets.some(t => t.endowsTo(target.pointer))) {
      return "named";
    }

    if (hasClassCriteria) {
      let targetClasses = target.getClasses();

      // Check if target has any of the required classes
      if (!targetClasses.some(c1 => classes.some(c2 => c1.pointer.denotesSame(c2)))) {
        return undefined;
      }

      // If there are no type criteria, the class match alone is sufficient.
      if (!hasTypeCriteria) {
        return "class";
      }
    }

    const resultIfMatched = hasClassCriteria ? "class and type" : "type";

    // Check if the target matches any link types
    if (target.isLink && linkTypes.some(t => t.denotesSame(target.type))) {
      return resultIfMatched;
    }

    // Check if the target matches any clip types
    if (target.isClip && clipTypes.some(t => t === target.pointer.pointerType)) {
      return resultIfMatched;
    }

    // Check if the target matches any edl types
    if (target.isEdl && edlTypes.some(t => t.denotesSame(target.type))) {
      return resultIfMatched;
    }

    // Nothing matched
    return undefined;
  }

  // Return the final object
  return finalObject(obj, {
    match
  });
}

function withinLevelScope(target, levels) {
  if (levels.length === 0) { return true; }

  const containers = target.getContainers();
  const [levelDepths, distances] = getContainerLevelsAsMaps(containers);
  let distance = Number.MAX_SAFE_INTEGER;

  for (const level of levels) {
    const depth = levelDepths.get(level.classPointer.hashableName);
    if (!depth) {
      return;
    } else if (level?.depth && depth < level.depth) {
      return;
    }
    distance = Math.min(distance, distances.get(level.classPointer.hashableName));
  }

  return distance;
}
