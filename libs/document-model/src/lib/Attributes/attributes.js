import { addProperties, finalObject, memoize, listMap } from "@commonplace/utils";

export function Attributes(parent, renderPointers, defaultPointers) {
  let obj = {};

  function contentDescriptors() {
    let ourDescriptors = renderPointers.map(p => p.contentAttributeDescriptors()).flat();
    return ourDescriptors.concat(parent ? parent.contentDescriptors() : []);
  }

  function defaultContentDescriptors() {
    let ourDescriptors = defaultPointers.map(p => p.contentAttributeDescriptors()).flat();
    return ourDescriptors.concat(parent ? parent.defaultContentDescriptors() : []);
  }

  function winningValue(descriptors) {
    descriptors.sort((a, b) => a.endowmentType === b.endowmentType
      ? a.endowingPointer.comparePriority(b.endowingPointer)
      : (a.endowmentType === "direct" ? -1 : 1));
    return descriptors[0].attributeValue;
  }

  function buildAttributeValueMap(attributeDescriptors) {
    let byAttributeName = listMap();
    attributeDescriptors.forEach(a => byAttributeName.push(a.attributeName, a));
    let attributes = new Map([...byAttributeName.entries()].map(([name, descriptors]) => [name, winningValue(descriptors)]));
    return attributes;
  }

  function values() {
    let directAttributeDescriptors = renderPointers.map(p => p.directAttributeDescriptors()).flat();
    let defaultDirectAttributeDescriptors = defaultPointers.map(p => p.directAttributeDescriptors()).flat();
    let allDescriptors = directAttributeDescriptors.concat(
      contentDescriptors(),
      defaultContentDescriptors(),
      defaultDirectAttributeDescriptors);

    return buildAttributeValueMap(allDescriptors);
  }

  addProperties(obj, {
    values: memoize(values)
  });

  return finalObject(obj, {
    contentDescriptors,
    defaultContentDescriptors
  });
}

export let attributesTesting = {
  hasAttribute(values, attribute, expectedValue) {
    if (!values.has(attribute)) {
      return {
        pass: false,
        message: () => `expected attribute ${attribute} was not found`
      };
    }
  
    if (values.get(attribute) !== expectedValue) {
      return {
        pass: false,
        message: () => `expected attribute ${attribute} to have value ${expectedValue}, actually ${values.get(attribute)}`
      };
     } else {
      return {
      pass: true,
        message: () => `expected attribute ${attribute} to have value different from ${expectedValue}`
      };
    }
  },
  
  hasExactlyAttributes(values, ...attributeValuePairs) {
    let keys = [...values.keys()];
    for (let i = 0; i < attributeValuePairs.length; i += 2) {
      let present = attributesTesting.hasAttribute(values, attributeValuePairs[i], attributeValuePairs[i+1]);
      if (!present.pass) {
        return present;
      }
      keys = keys.filter(x => x !== attributeValuePairs[i]);
    }
  
    if (keys.length == 0) {
      return {
        pass: true,
        message: () => "Expected additional keys"
      };
    } else {
      return {
        pass: false,
        message: () => `Unexpected keys: ${JSON.stringify(keys)}`
      };
    }
  }
};
